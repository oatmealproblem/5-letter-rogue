import { LETTERS } from '$lib/constants';
import type { Entity } from '$lib/types';

export const letters = Object.fromEntries(
	LETTERS.map<[string, Omit<Entity, 'id' | 'x' | 'y'>]>((letter) => [
		letter,
		{
			letter,
			name: letter.toUpperCase(),
			glyph: {
				char: letter.toUpperCase(),
				class: 'font-letter text-gray-300 z-40',
			},
		},
	]),
) as Record<(typeof LETTERS)[number], Omit<Entity, 'id' | 'x' | 'y'>>;
