import actions from '$lib/actions';
import type { Game } from '$lib/game.svelte';
import type { Status } from '$lib/types';

export function statusSystem(game: Game) {
	for (const entity of game.with('statuses')) {
		for (const key of Object.keys(entity.statuses) as Status[]) {
			if (key === 'bleeding' && entity.statuses[key] && entity.hp) {
				actions.damage({ game, target: entity, amount: 1, type: 'raw' });
			}
			if (key === 'regen' && entity.statuses[key] && entity.hp) {
				actions.heal({ target: entity, amount: entity.hp.max * 0.1 });
			}
			if (key === 'regen+' && entity.statuses[key] && entity.hp) {
				actions.heal({ target: entity, amount: entity.hp.max * 0.21 });
			}
			if (typeof entity.statuses[key] === 'number') {
				if (entity.statuses[key] <= 1) {
					delete entity.statuses[key];
				} else {
					entity.statuses[key]--;
				}
			}
		}
	}
}
