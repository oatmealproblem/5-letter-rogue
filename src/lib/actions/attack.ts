import type { Game } from '$lib/game.svelte';
import type { Entity, Status } from '$lib/types';

import { damage } from './damage';
import { inflict } from './inflict';

export function attack({ game, actor, target }: { game: Game; actor: Entity; target: Entity }) {
	if (target.hp && actor.attack) {
		damage({ game, target, amount: actor.attack.damage });
		if (target.statuses && actor.attack.inflicts) {
			for (const [status, duration] of Object.entries(actor.attack.inflicts) as [
				Status,
				number,
			][]) {
				inflict({ target, status, duration });
				const current = target.statuses[status as Status] ?? 0;
				if (current === true) continue;
				target.statuses[status as Status] = current + duration;
			}
		}
		game.playVfx('slash', target);
		game.playVfx(`bump:${actor.id}`, target);
		game.playSfx('knifeSlice');
		return true;
	}
	return false;
}
