import actions from '$lib/actions';
import { getPosInRange } from '$lib/geo';
import type { Ability } from '$lib/types';

export const blast: Ability = {
	name: 'blast',
	description: 'Does 3 physical damage in a 1 tile burst.',
	target: 'tile',
	highlight(actor, targetPos, game) {
		const guide = getPosInRange(targetPos, 1, 'chebyshev');
		const target = guide.filter((p) => game.at(p).some((e) => e.hp));
		return { guide, harm: target, help: [] };
	},
	execute(actor, targetPos, game) {
		game.playSfx('explosion');
		for (const pos of this.highlight(actor, targetPos, game).harm) {
			for (const entity of game.at(pos)) {
				actions.damage({ game, target: entity, amount: 3 });
			}
		}
	},
};
