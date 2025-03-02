import type { Game } from '$lib/game.svelte';
import type { Status } from '$lib/types';

export function statusSystem(game: Game) {
	for (const actor of game.with('statuses')) {
		for (const key of Object.keys(actor.statuses) as Status[]) {
			if (typeof actor.statuses[key] === 'number') {
				if (actor.statuses[key] === 1) {
					delete actor.statuses[key];
				} else {
					actor.statuses[key]--;
				}
			}
		}
	}
}
