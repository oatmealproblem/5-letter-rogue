import type { Template } from '$lib/types';

export const enemies = {
	snake: {
		name: 'snake',
		synonyms: ['viper'],
		description: 'Attacks for 1 damage and 3 poison',
		ai: true,
		attack: { damage: 1, inflicts: { poisoned: 3 } },
		glyph: { char: 'S', class: 'font-creature text-emerald-500 z-50' },
		hp: { current: 5, max: 5 },
		statuses: {},
		team: 'enemy',
	},
} satisfies Record<string, Template>;
