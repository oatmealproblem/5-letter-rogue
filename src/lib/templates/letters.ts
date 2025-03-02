import { LETTERS } from '$lib/constants';
import type { Letter, Template } from '$lib/types';

export const letters = Object.fromEntries(
	LETTERS.map<[string, Template]>((letter) => [
		letter,
		{
			letter,
			name: letter.toUpperCase(),
			description: `The letter ${letter.toUpperCase()}; you can pick it up!`,
			glyph: {
				char: letter.toUpperCase(),
				class: 'font-letter text-gray-300 z-40',
			},
		},
	]),
) as Record<Letter, Template>;
