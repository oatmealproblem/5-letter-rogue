import actions from '$lib/actions';
import { getPosInRange } from '$lib/geo';
import type { Ability } from '$lib/types';

import { has } from './utils';

export const blast: Ability = {
	name: 'blast',
	synonyms: ['burst'],
	description: 'Does 4 physical damage in a 1 tile radius.',
	attributes: { physicalDamage: 4, radius: 1 },
	highlight(actor, target, game) {
		const guide = getPosInRange(target, this.attributes.radius ?? 0, 'euclidean');
		const harm = guide.filter((p) => game.at(p).some((e) => e.hp));
		return { guide, harm, help: [] };
	},
	execute(actor, target, game) {
		game.playSfx('explosion');
		for (const pos of this.highlight(actor, target, game).harm) {
			for (const entity of game.at(pos).filter(has('hp'))) {
				actions.damage({
					game,
					target: entity,
					amount: this.attributes.physicalDamage ?? 0,
					type: 'physical',
				});
				game.playVfx('slash', entity);
			}
		}
		return true;
	},
};
