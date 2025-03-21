import type { Game } from './game.svelte';

export interface Pos {
	x: number;
	y: number;
}

export interface Ability {
	name: string;
	synonyms?: string[];
	synonymOf?: string;
	description: string;
	summon?: boolean;
	attributes: {
		radius?: number;
		physicalDamage?: number;
		magicDamage?: number;
		healing?: number;
		duration?: number;
	};
	highlight: (
		actor: Entity | null,
		target: Pos | Entity,
		game: Game,
	) => { guide: Pos[]; harm: Pos[]; help: Pos[] };
	execute: (actor: Entity | null, target: Pos | Entity, game: Game) => boolean;
}

export type Letter = keyof Inventory;

export interface AI {
	abilities: {
		ability: string;
		countsAsTurn: boolean;
		cooldown: number;
		currentCooldown: number;
	}[];
	canDoubleMove?: boolean;
	canMoveAndAttack?: boolean;
}

export interface Attack {
	damage: number;
	inflicts?: Partial<Record<Status, number>>;
}

export interface Glyph {
	char: string;
	class: string;
}

export interface HP {
	current: number;
	max: number;
	partial?: number; // used for healing
}

export interface Inventory {
	a?: number;
	b?: number;
	c?: number;
	d?: number;
	e?: number;
	f?: number;
	g?: number;
	h?: number;
	i?: number;
	j?: number;
	k?: number;
	l?: number;
	m?: number;
	n?: number;
	o?: number;
	p?: number;
	q?: number;
	r?: number;
	s?: number;
	t?: number;
	u?: number;
	v?: number;
	w?: number;
	x?: number;
	y?: number;
	z?: number;
}

export interface Level {
	current: number;
	max: number;
	exiles: Entity[];
}

export interface Statuses {
	armored?: true | number;
	bleeding?: true | number;
	dodging?: true | number;
	floating?: true | number;
	hidden?: true | number;
	immobilized?: true | number;
	loyal?: true | number;
	poisoned?: true | number;
	regen?: true | number;
	'regen+'?: true | number;
	stunned?: true | number;
}
export type Status = keyof Statuses;

export interface Entity {
	id: string;
	x: number;
	y: number;
	ai?: AI;
	aiCost?: number;
	attack?: Attack;
	description?: string;
	glyph?: Glyph;
	hp?: HP;
	inventory?: Inventory;
	letter?: Letter;
	level?: Level;
	onEnter?: string;
	onTurnEnd?: string;
	name?: string;
	player?: true;
	team?: string;
	terrain?: true;
	threat?: number;
	statuses?: Statuses;
	synonyms?: string[];
}

export type Template = Omit<Entity, 'id' | 'x' | 'y'>;
