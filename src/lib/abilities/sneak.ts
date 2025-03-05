import actions from '$lib/actions';
import type { Ability } from '$lib/types';

import { getTargetEntities, has } from './utils';

export const sneak: Ability = {
	name: 'sneak',
	synonyms: ['crawl', 'creep', 'prowl', 'shirk', 'skulk', 'slink', 'stalk'],
	description: 'Become hidden for 5 turns.',
	attributes: { duration: 5 },
	highlight(actor, target, game) {
		if (game.at(target).some(has('statuses'))) {
			return { guide: [], harm: [], help: [target] };
		} else {
			return { guide: [target], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'help', actor, target, game });
		if (targets.length) {
			for (const entity of targets) {
				actions.inflict({
					target: entity,
					status: 'hidden',
					duration: (this.attributes.duration ?? 0) + 1,
				});
				game.playVfx('good-magic', entity);
			}
			game.playSfx('magic');
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};
