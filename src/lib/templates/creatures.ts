import type { Template } from '$lib/types';

export const creatures = {
	slime: {
		name: 'slime',
		description: 'Attacks for 1 damage; slowly heals and splits',
		ai: {
			abilities: [
				{
					ability: 'slimeSplit',
					cooldown: 0,
					currentCooldown: 0,
					countsAsTurn: false,
				},
			],
		},
		attack: { damage: 1 },
		glyph: { char: 'S', class: 'font-creature text-lime-500 z-50' },
		hp: { current: 2, max: 2 },
		statuses: { rejuvenating: true },
		team: 'enemy',
		threat: 2,
	},
	snake: {
		name: 'snake',
		synonyms: ['adder', 'cobra', 'viper'],
		description: 'Attacks for 1 damage and 3 poison',
		ai: { abilities: [] },
		attack: { damage: 1, inflicts: { poisoned: 3 } },
		glyph: { char: 'S', class: 'font-creature text-emerald-500 z-50' },
		hp: { current: 2, max: 2 },
		statuses: {},
		team: 'enemy',
		threat: 1,
	},
} satisfies Record<string, Template>;
