import { inflict } from '$lib/actions/inflict';
import { POSITIVE_STATUSES } from '$lib/statuses';
import type { Ability } from '$lib/types';

import { getTargetEntities, has } from './utils';

export const curse: Ability = {
	name: 'curse',
	synonyms: [],
	description: 'Remove all positive conditions from any creature.',
	attributes: {},
	highlight(actor, target, game) {
		if (game.at(target).some(has('statuses'))) {
			return { guide: [], harm: [target], help: [] };
		} else {
			return { guide: [target], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'harm', actor, target, game });
		if (targets.length) {
			for (const entity of targets) {
				if (entity.statuses) {
					for (const status of POSITIVE_STATUSES.values()) {
						delete entity.statuses[status];
					}
				}
			}
			game.playSfx('magic');
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const sting: Ability = {
	name: 'sting',
	synonyms: [],
	description: 'Inflict 10 turns of poison.',
	attributes: { duration: 10 },
	highlight(actor, target, game) {
		if (game.at(target).some(has('statuses'))) {
			return { guide: [], harm: [target], help: [] };
		} else {
			return { guide: [target], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'harm', actor, target, game });
		if (targets.length) {
			for (const entity of targets) {
				inflict({ target: entity, status: 'poisoned', duration: this.attributes.duration ?? 0 });
			}
			game.playSfx('magic');
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};
