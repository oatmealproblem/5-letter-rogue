import type { Entity } from '$lib/types';

export const enemies = {
	snake: {
		name: 'snake',
		ai: true,
		team: 'enemy',
		attack: { damage: 1 },
		glyph: { char: 'S', class: 'font-creature text-emerald-500 z-50' },
		hp: { current: 5, max: 5 },
	},
} satisfies Record<string, Omit<Entity, 'x' | 'y' | 'id'>>;
