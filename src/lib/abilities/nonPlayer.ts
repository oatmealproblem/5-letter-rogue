import { damage } from '$lib/actions/damage';
import { inflict } from '$lib/actions/inflict';
import type { Ability } from '$lib/types';

import { exile } from './exile';
import { isEntity } from './utils';

export const waterOnEnter: Ability = {
	name: 'waterOnEnter',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target) {
		if (isEntity(target) && !target.statuses?.floating) {
			inflict({ target, status: 'immobilized', duration: 2 });
		}
		return true;
	},
};

export const abyssOnEnter: Ability = {
	name: 'abyssOnEnter',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target, game) {
		for (const entity of game.at(target)) {
			if (!entity.statuses?.floating) {
				if (entity.hp) {
					damage({ game, target: entity, amount: Math.floor(entity.hp?.current / 2) });
				}
				if (entity.player) {
					game.nextLevel({ collectLetters: false });
				} else {
					exile.execute(actor, entity, game);
				}
			}
		}
		return true;
	},
};

export const flameOnTurnEnd: Ability = {
	name: 'flameOnTurnEnd',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target, game) {
		for (const entity of game.at(target)) {
			if (!entity.statuses?.floating) {
				damage({ game, target: entity, amount: 1 });
			}
		}
		return true;
	},
};
