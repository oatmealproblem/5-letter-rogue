import actions from '$lib/actions';
import { NEGATIVE_STATUSES } from '$lib/statuses';
import type { Ability } from '$lib/types';

export const snack: Ability = {
	name: 'snack',
	synonyms: [
		'apple',
		'bacon',
		'bagel',
		'berry',
		'bread',
		'broth',
		'candy',
		'chili',
		'chips',
		'cocoa',
		'curry',
		'donut',
		'feast',
		'fries',
		'fruit',
		'fudge',
		'grape',
		'gravy',
		'honey',
		'jelly',
		'jerky',
		'juice',
		'kebab',
		'latte',
		'lemon',
		'lunch',
		'maize',
		'mango',
		'melon',
		'nacho',
		'olive',
		'onion',
		'pasta',
		'peach',
		'pepsi',
		'pizza',
		'salad',
		'sauce',
		'shake',
		'steak',
		'sugar',
		'sushi',
		'sweet',
		'syrup',
		'toast',
		'torte',
		'wafer',
	].sort(),
	description: 'Create and eat food to heal 10 HP.',
	attributes: { healing: 10 },
	highlight(actor) {
		return { guide: [], harm: [], help: actor ? [{ x: actor.x, y: actor.y }] : [] };
	},
	execute(actor, targetPos, game) {
		if (actor && actor.hp && actor.hp.current < actor.hp.max) {
			const success = actions.heal({ target: actor, amount: this.attributes.healing ?? 0 });
			if (success) {
				game.playVfx('good-magic', actor);
				game.playSfx('magic');
			} else {
				game.playSfx('uiError');
			}
			return success;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const treat: Ability = {
	name: 'treat',
	synonyms: ['nurse', 'patch'],
	description: 'Grant any creature 4 turns of regen+',
	attributes: { healing: 5 },
	highlight(actor, target, game) {
		if (game.at(target).some((e) => e.hp)) {
			return { guide: [], harm: [], help: [target] };
		} else {
			return { guide: [target], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const highlights = this.highlight(actor, target, game);
		if (highlights.help.length) {
			for (const pos of highlights.help) {
				for (const entity of game.at(pos)) {
					actions.inflict({ target: entity, status: 'regen+', duration: 4 });
					game.playVfx('good-magic', entity);
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

export const detox: Ability = {
	name: 'detox',
	description: 'Remove all negative statuses.',
	attributes: {},
	highlight(actor, target, game) {
		if (
			game.at(target).some((e) => NEGATIVE_STATUSES.values().some((status) => e.statuses?.[status]))
		) {
			return { guide: [], harm: [], help: [target] };
		} else {
			return { guide: [target], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const highlights = this.highlight(actor, target, game);
		if (highlights.help.length) {
			for (const pos of highlights.help) {
				for (const entity of game.at(pos)) {
					if (entity.statuses) {
						for (const status of NEGATIVE_STATUSES.values()) {
							delete entity.statuses[status];
						}
						game.playVfx('good-magic', entity);
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
