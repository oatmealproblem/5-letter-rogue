import { RNG } from 'rot-js';

import actions from '$lib/actions';
import { damage } from '$lib/actions/damage';
import { inflict } from '$lib/actions/inflict';
import { getChebyshevDistance, getManhattanDistance, getPosInRange, isOutOfBounds } from '$lib/geo';
import { createFromTemplate, type TemplateId, templates } from '$lib/templates';
import type { Ability } from '$lib/types';

import { split } from './clone';
import { exile } from './exile';
import { charm } from './team';
import { has, isEntity } from './utils';

export const waterOnEnter: Ability = {
	name: 'waterOnEnter',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target) {
		if (isEntity(target) && !target.statuses?.floating) {
			inflict({ target, status: 'immobilized', duration: 2 });
		}
		return true;
	},
};

export const abyssOnEnter: Ability = {
	name: 'abyssOnEnter',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target, game) {
		for (const entity of game.at(target).filter((e) => e.ai || e.player)) {
			if (!entity.statuses?.floating) {
				if (entity.hp) {
					damage({
						game,
						target: entity,
						amount: Math.floor(entity.hp?.current / 2),
						type: 'physical',
					});
				}
				if (entity.player) {
					game.nextLevel({ collectLetters: false });
				} else {
					exile.execute(actor, entity, game);
				}
			}
		}
		return true;
	},
};

export const flameOnTurnEnd: Ability = {
	name: 'flameOnTurnEnd',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target, game) {
		for (const entity of game.at(target)) {
			if (!entity.statuses?.floating) {
				damage({ game, target: entity, amount: 1, type: 'magic' });
			}
		}
		return true;
	},
};

export const slimeSplit: Ability = {
	name: 'slimeSplit',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target, game) {
		if (!actor) return false;
		if (actor.hp?.current === actor.hp?.max && RNG.getUniform() <= 0.25) {
			return split.execute(actor, actor, game);
		}
		return false;
	},
};

export const druidSummon: Ability = {
	name: 'druidSummon',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target, game) {
		if (!actor) return false;
		const pos = getPosInRange(actor, 3, 'chebyshev')
			.filter((pos) => !isOutOfBounds(pos))
			.sort((a, b) => getChebyshevDistance(actor, a) - getChebyshevDistance(actor, b))
			.find((pos) => !game.at(pos).some((e) => e.hp || e.aiCost));
		if (!pos) return false;
		const options = ['eagle', 'hyena', 'viper', 'tiger'] as const;
		const level = game.get('level')?.level?.current ?? 1;
		const template = RNG.getWeightedValue(
			Object.fromEntries(
				options.map<[string, number]>((option) => {
					const threat = templates[option].threat ?? 0;
					// if level 3, threat -> weight
					// 1 -> 33
					// 2 -> 50
					// 3 ->100
					// 4 -> 50
					// 5 -> 25
					// 6 -> 16
					let weight = 100;
					if (threat < level) weight /= level - threat + 1;
					if (threat > level) weight /= (threat - level) * 2;
					return [option, weight];
				}),
			),
		) as TemplateId;
		game.add(createFromTemplate(template, { ...pos, team: actor.team }));
		game.playVfx('good-magic', pos);
		return true;
	},
};

export const sirenCharm: Ability = {
	name: 'sirenCharm',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target, game) {
		if (!actor) return false;
		const targetEntity = game
			.with('ai')
			.filter((e) => e.team !== actor.team && !e.statuses?.loyal)
			.sort((a, b) => getManhattanDistance(actor, a) - getManhattanDistance(actor, b))[0];
		if (!targetEntity) return false;
		return charm.execute(actor, targetEntity, game);
	},
};

export const fiendFlame: Ability = {
	name: 'fiendFlame',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target, game) {
		if (!actor) return false;
		const targetEntity = game
			.with('team', 'hp')
			.filter((e) => e.team !== actor.team && getManhattanDistance(actor, e) === 1)
			.sort((a, b) => getManhattanDistance(actor, a) - getManhattanDistance(actor, b))[0];
		if (!targetEntity) return false;
		if (targetEntity.statuses?.hidden) return false;
		actions.attack({ actor, target: targetEntity, game });
		if (!game.at(targetEntity).some(has('terrain'))) {
			game.add(createFromTemplate('flame', { x: targetEntity.x, y: targetEntity.y }));
		}
		return true;
	},
};
