import type { Template } from '$lib/types';

export const terrain = {
	abyss: {
		name: 'abyss',
		description: 'Fall to the next level, taking damage.',
		glyph: {
			char: 'A',
			class: 'bg-black text-gray-800 font-terrain',
		},
		onEnter: 'abyssOnEnter',
		aiCost: Infinity,
	},
	flame: {
		name: 'flame',
		description: 'Deals 1 magic damage each turn.',
		glyph: {
			char: 'F',
			class: 'bg-orange-950 text-orange-600 font-terrain',
		},
		onTurnEnd: 'flameOnTurnEnd',
		aiCost: 3,
	},
	water: {
		name: 'water',
		description: 'Immobilizes non-swimming creatures for 1 turn.',
		glyph: {
			char: 'W',
			class: 'bg-blue-950 text-blue-700 font-terrain',
		},
		onEnter: 'waterOnEnter',
		aiCost: 1,
	},
} satisfies Record<string, Template>;
