import type { Game } from '$lib/game.svelte';
import type { Entity, Status } from '$lib/types';

import { damage } from './damage';
import { inflict } from './inflict';

export function attack({ game, actor, target }: { game: Game; actor: Entity; target: Entity }) {
	if (target.hp && actor.attack) {
		// abort early for dodge
		if (target.statuses?.dodging) {
			game.playVfx('slash', target);
			game.playVfx(`bump:${actor.id}`, target);
			game.playSfx('knifeSlice');
			return true;
		}

		let damageMultiplier = 1;
		if (actor.statuses?.hidden) {
			damageMultiplier = 2;
			actor.statuses.hidden = 1; // expires at end of turn, but still applies to other attacks in the same turn
		}
		damage({ game, target, type: 'physical', amount: actor.attack.damage * damageMultiplier });
		if (target.statuses && actor.attack.inflicts) {
			for (const [status, duration] of Object.entries(actor.attack.inflicts) as [
				Status,
				number,
			][]) {
				inflict({ target, status, duration });
			}
		}
		game.playVfx('slash', target);
		game.playVfx(`bump:${actor.id}`, target);
		game.playSfx('knifeSlice');
		return true;
	}
	return false;
}
