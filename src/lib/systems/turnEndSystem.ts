import abilities from '$lib/abilities';
import type { Game } from '$lib/game.svelte';

export function turnEndSystem(game: Game) {
	for (const entity of game.with('onTurnEnd')) {
		abilities[entity.onTurnEnd]?.execute(entity, { x: entity.x, y: entity.y }, game);
	}
}
