import abilities from '$lib/abilities';
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
	if (
		!actor.statuses?.immobilized &&
		!isOutOfBounds(destination) &&
		!game.at(destination).some((e) => e.hp)
	) {
		actor.x += dx;
		actor.y += dy;

		const letter = game.at(destination).find((e) => e.letter);
		if (letter?.letter && actor.inventory) {
			game.remove(letter);
			actor.inventory[letter.letter] = (actor.inventory[letter.letter] ?? 0) + 1;
		}

		for (const entity of game.at(destination)) {
			if (entity.onEnter) {
				abilities[entity.onEnter]?.execute(entity, actor, game);
			}
		}

		game.playSfx('footstep');
		return true;
	}
	if (actor.id === 'player') game.playSfx('uiError');
	return false;
}
