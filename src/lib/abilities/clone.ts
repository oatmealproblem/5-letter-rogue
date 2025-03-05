import { nanoid } from 'nanoid/non-secure';

import actions from '$lib/actions';
import { getChebyshevDistance, getPosInRange, isOutOfBounds } from '$lib/geo';
import type { Ability } from '$lib/types';

import { deepClone, getTargetEntities, has } from './utils';

export const clone: Ability = {
	name: 'clone',
	synonyms: ['xerox'],
	description: 'Create a copy of a creature.',
	attributes: { duration: 5 },
	highlight(actor, target, game) {
		if (game.at(target).some(has('ai'))) {
			return { guide: [], harm: [], help: [target] };
		} else {
			return { guide: [target], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'help', actor, target, game }).filter(
			has('ai'),
		);
		if (targets.length) {
			for (const entity of targets) {
				const pos = getPosInRange(entity, 3, 'chebyshev')
					.filter((pos) => !isOutOfBounds(pos))
					.sort((a, b) => getChebyshevDistance(entity, a) - getChebyshevDistance(entity, b))
					.find((pos) => !game.at(pos).some((e) => e.hp || e.aiCost));
				if (!pos) continue;
				const copy = {
					...deepClone(entity),
					...pos,
					id: `${entity.name}-${nanoid(12)}`,
				};
				game.add(copy);
				game.playVfx('good-magic', copy);
			}
			game.playSfx('magic');
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const split: Ability = {
	name: 'split',
	description: 'Deal half damage then clone.',
	attributes: { duration: 5 },
	highlight(actor, target, game) {
		return clone.highlight(actor, target, game);
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'help', actor, target, game }).filter(
			has('ai'),
		);
		if (targets.length) {
			for (const entity of targets) {
				const pos = getPosInRange(entity, 3, 'chebyshev')
					.filter((pos) => !isOutOfBounds(pos))
					.sort((a, b) => getChebyshevDistance(entity, a) - getChebyshevDistance(entity, b))
					.find((pos) => !game.at(pos).some((e) => e.hp || e.aiCost));
				if (!pos) continue;
				if (entity.hp) {
					actions.damage({
						game,
						target: entity,
						amount: Math.floor(entity.hp.current / 2),
						type: 'raw',
					});
				}
				const copy = {
					...deepClone(entity),
					...pos,
					id: `${entity.name}-${nanoid(12)}`,
				};
				game.add(copy);
				game.playVfx('good-magic', copy);
			}
			game.playSfx('magic');
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};
