import * as devalue from 'devalue';
import { RNG } from 'rot-js';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type { SetRequired } from 'type-fest';

import { letterWeights } from './abilities';
import { playSound, type SoundId } from './audio';
import { LETTERS } from './constants';
import { CARDINAL_DIRECTIONS, getPosInRange, isSamePos } from './geo';
import { fib, rangeFromTo } from './math';
import { aiSystem } from './systems/aiSystem';
import { statusSystem } from './systems/statusSystem';
import { turnEndSystem } from './systems/turnEndSystem';
import { createFromTemplate, type TemplateId, templates } from './templates';
import { terrain } from './templates/terrain';
import type { Entity, Letter, Pos } from './types';

const GUARANTEED_KEYS = new Set(['id', 'x', 'y']);

type VfxHandler = (vfx: string, pos: Pos) => void;
type SfxHandler = (sfx: SoundId) => void;

export class Game {
	#entities: Map<string, Entity> = new SvelteMap();
	#proxies: Map<Entity, Entity> = new Map();
	#entitiesByPosition: Map<string, Set<Entity>> = new SvelteMap();
	#entitiesByComponent: Map<string, Set<Entity>> = new SvelteMap();
	#vfxHandlers: VfxHandler[] = [];
	#sfxHandlers: SfxHandler[] = [];

	#proxyHandler: ProxyHandler<Entity> = {
		set: (target, key, value) => {
			if (key === 'x' || key === 'y') {
				const oldPosKey = `${target.x},${target.y}`;
				target[key] = value;
				const newPosKey = `${target.x},${target.y}`;
				if (oldPosKey !== newPosKey) {
					this.#entitiesByPosition.get(oldPosKey)?.delete(target);
					if (!this.#entitiesByPosition.has(newPosKey))
						this.#entitiesByPosition.set(newPosKey, new SvelteSet());
					this.#entitiesByPosition.get(newPosKey)?.add(target);
				}
				return true;
			} else if (typeof key === 'string' && !GUARANTEED_KEYS.has(key)) {
				if (value == null) {
					delete target[key as keyof Entity];
					this.#entitiesByComponent.get(key)?.delete(target);
				} else {
					const isNew = !(key in target);
					// @ts-expect-error -- coercing to keyof Entity doesn't work for some reason
					target[key] = value;
					if (isNew) {
						if (!this.#entitiesByComponent.has(key))
							this.#entitiesByComponent.set(key, new SvelteSet());
						this.#entitiesByComponent.get(key)?.add(target);
					}
				}
				return true;
			}
			return false;
		},
		deleteProperty: (target, key) => {
			delete target[key as keyof Entity];
			if (typeof key === 'string' && !GUARANTEED_KEYS.has(key)) {
				this.#entitiesByComponent.get(key)?.delete(target);
			}
			return true;
		},
	};

	add(entity: Entity): Entity {
		const stateful = $state(entity);
		const proxy = new Proxy(stateful, this.#proxyHandler);
		this.#entities.set(stateful.id, stateful);
		this.#proxies.set(stateful, proxy);
		const posKey = `${stateful.x},${stateful.y}`;
		if (this.#entitiesByPosition.has(posKey)) {
			this.#entitiesByPosition.get(posKey)?.add(stateful);
		} else {
			this.#entitiesByPosition.set(posKey, new SvelteSet([stateful]));
		}
		for (const component of Object.keys(stateful).filter((key) => !GUARANTEED_KEYS.has(key))) {
			if (this.#entitiesByComponent.has(component)) {
				this.#entitiesByComponent.get(component)?.add(stateful);
			} else {
				this.#entitiesByComponent.set(component, new SvelteSet([stateful]));
			}
		}
		return proxy;
	}

	remove(entity: Entity) {
		const unproxied = this.#entities.get(entity.id);
		if (unproxied) {
			this.#entities.delete(entity.id);
			this.#proxies.delete(unproxied);
			this.#entitiesByPosition.values().forEach((set) => set.delete(unproxied));
			this.#entitiesByComponent.values().forEach((set) => set.delete(unproxied));
		}
	}

	get_UNPROXIED(id: string) {
		return this.#entities.get(id);
	}
	get(id: string) {
		const entity = this.get_UNPROXIED(id);
		return entity ? this.#proxies.get(entity) : undefined;
	}

	at_UNPROXIED({ x, y }: Pos) {
		return this.#entitiesByPosition.get(`${x},${y}`) ?? new Set();
	}
	at(pos: Pos) {
		return Array.from(this.at_UNPROXIED(pos)).map((entity) => this.#proxies.get(entity)!);
	}

	with_UNPROXIED<T extends keyof Omit<Entity, 'id' | 'x' | 'y'>>(...components: [T, ...T[]]) {
		const [first, ...rest] = components;
		let result = this.#entitiesByComponent.get(first) ?? new Set();
		for (const comp of rest) {
			result = result.intersection(this.#entitiesByComponent.get(comp) ?? new Set());
		}
		return result as unknown as Set<SetRequired<Entity, T>>;
	}
	with<T extends keyof Omit<Entity, 'id' | 'x' | 'y'>>(...components: [T, ...T[]]) {
		return Array.from(this.with_UNPROXIED(...components)).map(
			(entity) => this.#proxies.get(entity as unknown as Entity)!,
		) as unknown as SetRequired<Entity, T>[];
	}

	registerVfxHandler(handler: VfxHandler): () => void {
		this.#vfxHandlers.push(handler);
		const unregister = () => {
			this.#vfxHandlers.splice(this.#vfxHandlers.indexOf(handler), 1);
		};
		return unregister;
	}

	playVfx(vfx: string, pos: Pos) {
		this.#vfxHandlers.forEach((handler) => handler(vfx, pos));
	}

	registerSfxHandler(handler: SfxHandler): () => void {
		this.#sfxHandlers.push(handler);
		const unregister = () => {
			this.#sfxHandlers.splice(this.#sfxHandlers.indexOf(handler), 1);
		};
		return unregister;
	}

	playSfx(sfx: SoundId) {
		this.#sfxHandlers.forEach((handler) => handler(sfx));
	}

	processTurn() {
		aiSystem(this);
		statusSystem(this);
		turnEndSystem(this);
		this.save();
	}

	save() {
		localStorage.setItem('game', devalue.stringify(this.#entities));
	}

	reset() {
		this.#entities.clear();
		this.#proxies.clear();
		this.#entitiesByPosition.clear();
		this.#entitiesByComponent.clear();
	}

	load() {
		this.reset();
		const saved = localStorage.getItem('game');
		if (saved) {
			const savedEntities = devalue.parse(saved) as Map<string, Entity>;
			for (const savedEntity of savedEntities.values()) {
				const entity = $state(savedEntity);
				this.add(entity);
			}
		}
	}

	new() {
		this.reset();

		const level: Entity = {
			id: 'level',
			x: 0,
			y: 0,
			level: {
				current: 0,
				max: 10,
				exiles: [],
			},
		};
		this.add(level);

		const player: Entity = {
			id: 'player',
			name: 'rogue',
			description: 'This is you.',
			x: 7,
			y: 7,
			attack: { damage: 2 },
			glyph: { char: '@', class: 'font-creature text-white z-50' },
			hp: { current: 15, max: 15 },
			inventory: Object.fromEntries(
				LETTERS.map((l) => [l, Math.ceil((letterWeights[l] ?? 0) / 20)]),
			),
			player: true,
			statuses: {},
			team: 'player',
		};
		this.add(player);

		this.nextLevel();

		this.save();
	}

	nextLevel({ collectLetters = true } = {}) {
		const level = $state.snapshot(this.get('level'));
		const player = $state.snapshot(this.get('player'));
		const letters = $state.snapshot(this.with('letter'));
		const loyalAllies = $state.snapshot(
			this.with('statuses').filter((e) => e.team === 'player' && e.statuses.loyal && !e.player),
		);
		if (!player?.player) throw new Error('Player not found');
		if (!level?.level) throw new Error('Level not found');
		this.reset();

		player.x = 7;
		player.y = 7;
		this.add(player);

		if (collectLetters) {
			for (const letter of letters) {
				if (player.inventory) {
					player.inventory[letter.letter] = (player.inventory[letter.letter] ?? 0) + 1;
				}
			}
		}

		level.level.current++;
		this.add(level);

		const emptyPositions = RNG.shuffle(
			getPosInRange(player, 7, 'chebyshev').filter((pos) => !isSamePos(player, pos)),
		);

		// terrain
		const terrainList = Object.keys(terrain) as TemplateId[];
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const _ of rangeFromTo(0, Math.floor(emptyPositions.length * 0.05))) {
			const pos = emptyPositions.pop();
			const terrainTemplateId = RNG.getItem(terrainList);
			if (pos && terrainTemplateId) {
				this.add(createFromTemplate(terrainTemplateId, pos));
				for (const dir of CARDINAL_DIRECTIONS) {
					const posToDir = { x: pos.x + dir.dx, y: pos.y + dir.dy };
					const emptyPosIndex = emptyPositions.findIndex(isSamePos(posToDir));
					if (emptyPosIndex !== -1 && RNG.getUniform() < 0.25) {
						emptyPositions.splice(emptyPosIndex, 1);
						this.add(createFromTemplate(terrainTemplateId, posToDir));
					}
				}
			}
		}

		// allies
		for (const ally of loyalAllies) {
			const pos = emptyPositions.pop();
			if (pos) {
				ally.x = pos.x;
				ally.y = pos.y;
				this.add(ally);
			}
		}

		// exiles
		for (const exile of level.level.exiles) {
			const pos = emptyPositions.pop();
			if (pos) {
				exile.x = pos.x;
				exile.y = pos.y;
				this.add(exile);
			}
		}
		level.level.exiles = [];

		// enemies
		const targetThreat = fib(level.level.current + 1);
		let currentThreat = 0;
		let threatIterations = 0;
		const threatTemplates = Object.entries(templates).filter(([, template]) => template.threat);
		while (currentThreat < targetThreat && threatIterations < 100) {
			threatIterations++;
			const weightedOptions = Object.fromEntries(
				threatTemplates
					.filter(([, template]) => (template.threat ?? 0) <= targetThreat - currentThreat)
					.map(([id, template]) => [id, Math.sqrt(template.threat ?? 0)]),
			);
			const templateId = RNG.getWeightedValue(weightedOptions);
			const pos = emptyPositions.pop();
			if (templateId && pos) {
				this.add(createFromTemplate(templateId as TemplateId, pos));
				currentThreat += templates[templateId as TemplateId].threat ?? 0;
			}
		}

		// letters
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const _ of rangeFromTo(0, Math.floor(emptyPositions.length * 0.05))) {
			const pos = emptyPositions.pop();
			const letter = RNG.getWeightedValue(letterWeights);
			if (letter && pos) {
				this.add(createFromTemplate(letter as Letter, pos));
			}
		}

		this.save();
	}
}

export const game = new Game();
game.load();
game.registerSfxHandler(playSound);
