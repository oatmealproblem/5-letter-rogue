import type { Game } from './game.svelte';

export interface Pos {
	x: number;
	y: number;
}

export interface Ability {
	name: string;
	description: string;
	target: 'self' | 'tile' | 'enemy' | 'ally' | 'creature' | 'direction';
	highlight: (
		actor: Entity,
		targetPos: Pos,
		game: Game,
	) => { guide: Pos[]; harm: Pos[]; help: Pos[] };
	execute: (actor: Entity, targetPos: Pos, game: Game) => void;
}

export type Letter = keyof Inventory;

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

export interface Statuses {
	poisoned?: true | number;
}
export type Status = keyof Statuses;

export interface Entity {
	id: string;
	x: number;
	y: number;
	ai?: true;
	attack?: Attack;
	description?: string;
	glyph?: Glyph;
	hp?: HP;
	inventory?: Inventory;
	letter?: Letter;
	name?: string;
	player?: true;
	team?: string;
	statuses?: Statuses;
}
