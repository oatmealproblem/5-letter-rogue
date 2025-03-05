import actions from '$lib/actions';
import { getEuclideanDistance, getLine } from '$lib/geo';
import type { Ability } from '$lib/types';

import { getTargetEntities, has } from './utils';

export const block: Ability = {
	name: 'block',
	synonyms: ['armor', 'brace', 'parry'],
	description: 'Become armored for 5 turns',
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
					status: 'armored',
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

export const dodge: Ability = {
	name: 'dodge',
	synonyms: ['avoid', 'evade'],
	description: 'Move to an adjacent or diagonal space evade all attacks',
	attributes: {},
	highlight(actor, target, game) {
		if (!actor) return { guide: [], harm: [], help: [] };
		const line = getLine(actor, target).filter(
			(pos) => Math.round(getEuclideanDistance(actor, pos)) <= 1,
		);
		const lastPos = line.at(-1);
		if (!lastPos) return { guide: [], harm: [], help: [] };
		if (game.at(lastPos).some((e) => e.hp)) return { guide: [lastPos], harm: [], help: [] };
		return { guide: [], harm: [], help: [lastPos] };
	},
	execute(actor, target, game) {
		const highlights = this.highlight(actor, target, game);
		if (actor && highlights.help.length) {
			game.playSfx('magic');
			actions.move({
				game,
				actor,
				dx: highlights.help[0].x - actor.x,
				dy: highlights.help[0].y - actor.y,
			});
			if (actor.statuses) {
				actor.statuses.dodging = 1;
			}
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};
