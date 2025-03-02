import type { Game } from '$lib/game.svelte';
import { isOutOfBounds } from '$lib/geo';
import type { Entity } from '$lib/types';

export function move({
	game,
	actor,
	dx,
	dy,
}: {
	game: Game;
	actor: Entity;
	dx: number;
	dy: number;
}) {
	const destination = { x: actor.x + dx, y: actor.y + dy };
	if (!isOutOfBounds(destination) && !game.at(destination).some((e) => e.hp)) {
		actor.x += dx;
		actor.y += dy;
		game.playSfx('footstep');

		const letter = game.at(destination).find((e) => e.letter);
		if (letter?.letter && actor.inventory) {
			game.remove(letter);
			actor.inventory[letter.letter] = (actor.inventory[letter.letter] ?? 0) + 1;
		}
		return true;
	}
	return false;
}
