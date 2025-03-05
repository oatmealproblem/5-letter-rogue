import { RNG } from 'rot-js';

import type { Game } from '$lib/game.svelte';
import { isOutOfBounds } from '$lib/geo';
import { createFromTemplate } from '$lib/templates';
import type { Entity, Letter } from '$lib/types';

export function damage({
	game,
	target,
	amount,
	type,
}: {
	game: Game;
	target: Entity;
	amount: number;
	type: 'physical' | 'magic' | 'raw';
}) {
	if (target.hp) {
		let resolvedAmount = amount;
		// armor reduces physical damage
		if (target.statuses?.armored && type === 'physical') {
			resolvedAmount -= 1;
		}
		// nothing changes raw damage
		if (type === 'raw') {
			resolvedAmount = amount;
		}
		// damage can never be negative
		resolvedAmount = Math.max(resolvedAmount, 0);
		target.hp.current -= resolvedAmount;
		if (resolvedAmount !== 0 && target.player) game.playSfx('grunt');

		if (target.hp.current <= 0) {
			game.remove(target);
			if (target.name && target.team !== 'player') {
				const letters = RNG.shuffle(target.name.toLowerCase().split(''));
				for (const letter of letters.slice(0, 3)) {
					const dx = RNG.getUniformInt(-1, 1);
					const dy = RNG.getUniformInt(-1, 1);
					const pos = { x: target.x + dx, y: target.y + dy };
					if (!isOutOfBounds(pos) && !game.at(pos).some((e) => e.player || e.letter)) {
						game.add(createFromTemplate(letter as Letter, pos));
					}
				}
			}
		}
		return true;
	}
	return false;
}
