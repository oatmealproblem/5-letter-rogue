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
		if (isEntity(target)) {
			inflict({ target, status: 'immobilized', duration: 2 });
		}
		return true;
	},
};

export const abyssOnEnter: Ability = {
	name: 'waterOnEnter',
	description: '',
	attributes: {},
	highlight() {
		return { guide: [], harm: [], help: [] };
	},
	execute(actor, target, game) {
		if (isEntity(target) && target.hp) {
			damage({ game, target, amount: Math.floor(target.hp?.current / 2) });
		}
		if (isEntity(target) && target.player) {
			game.nextLevel({ collectLetters: false });
		} else {
			exile.execute(actor, target, game);
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
			damage({ game, target: entity, amount: 1 });
		}
		return true;
	},
};
