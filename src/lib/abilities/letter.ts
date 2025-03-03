import { RNG } from 'rot-js';

import { getPosInRange } from '$lib/geo';
import type { Ability, Letter } from '$lib/types';

import { getTargetEntities, has } from './utils';

export const clean: Ability = {
	name: 'clean',
	description: 'Pick up all letters in a 3 tile radius',
	synonyms: ['brush', 'clear', 'scour', 'scrub', 'sweep'],
	attributes: { radius: 3 },
	highlight(actor, target, game) {
		const guide = getPosInRange(target, this.attributes.radius ?? 0, 'euclidean');
		const help = guide.filter((pos) => game.at(pos).some(has('letter')));
		return { guide, harm: [], help };
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'help', actor, target, game }).filter(
			has('letter'),
		);
		if (targets.length) {
			for (const entity of targets) {
				game.remove(entity);
				if (actor?.inventory) {
					actor.inventory[entity.letter] = (actor.inventory[entity.letter] ?? 0) + 1;
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

export const steal: Ability = {
	name: 'steal',
	synonyms: ['filch', 'mooch', 'pinch', 'swipe'],
	description: 'Steal all 5 letters from an enemy.',
	attributes: {},
	highlight(actor, target, game) {
		if (game.at(target).some(has('ai'))) {
			return { guide: [target], harm: [target], help: [] };
		} else {
			return { guide: [target], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'harm', actor, target, game }).filter(
			has('ai', 'name'),
		);
		if (targets.length) {
			for (const entity of targets) {
				if (entity.team === 'player') {
					entity.team = 'enemy';
				}
				const letters = RNG.shuffle(entity.name.split('')) as Letter[];
				for (const letter of letters) {
					if (actor?.inventory) {
						actor.inventory[letter] = (actor.inventory[letter] ?? 0) + 1;
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
