import type { Template } from '$lib/types';

export const terrain = {
	abyss: {
		name: 'abyss',
		description: 'Fall to the next level, losing half your current health.',
		glyph: {
			char: '↓',
			class: 'bg-black text-gray-800 font-terrain',
		},
		onEnter: 'abyssOnEnter',
		onTurnEnd: 'abyssOnEnter',
		aiCost: Infinity,
		terrain: true,
	},
	flame: {
		name: 'flame',
		description: 'Deals 1 magic damage each turn.',
		glyph: {
			char: '🔥',
			class: 'bg-orange-950 text-orange-600 font-terrain',
		},
		onTurnEnd: 'flameOnTurnEnd',
		aiCost: 3,
		terrain: true,
	},
	water: {
		name: 'water',
		description: 'Immobilizes non-swimming creatures for 1 turn.',
		glyph: {
			char: '',
			class: 'bg-blue-950 text-blue-700 font-terrain',
		},
		onEnter: 'waterOnEnter',
		aiCost: 1,
		terrain: true,
	},
} satisfies Record<string, Template>;
