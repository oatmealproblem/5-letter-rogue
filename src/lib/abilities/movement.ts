import actions from '$lib/actions';
import { getEuclideanDistance, getLine, stripPos } from '$lib/geo';
import type { Ability } from '$lib/types';

import { getTargetEntities } from './utils';

export const blink: Ability = {
	name: 'blink',
	synonyms: ['phase'],
	description: 'teleport to any space',
	attributes: {},
	highlight(actor, target, game) {
		if (game.at(target).some((e) => e.hp)) {
			return { guide: [stripPos(target)], harm: [], help: [] };
		} else {
			return { guide: [], harm: [], help: [stripPos(target)] };
		}
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
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const vault: Ability = {
	name: 'vault',
	synonyms: ['bound'],
	description: 'jump to any space in a 5-tile radius and attack everything in the path',
	attributes: {
		radius: 5,
	},
	highlight(actor, target, game) {
		if (!actor) return { guide: [], harm: [], help: [] };
		const guide = getLine(actor, target).filter(
			(pos) => Math.round(getEuclideanDistance(actor, pos)) <= (this.attributes.radius ?? 0),
		);
		const harm = guide.slice(1).filter((pos) => game.at(pos).some((e) => e.hp));
		const lastPos = guide.at(-1);
		const help = !lastPos || game.at(lastPos).some((e) => e.hp) ? [] : [lastPos];
		return { guide, harm, help };
	},
	execute(actor, target, game) {
		const highlights = this.highlight(actor, target, game);
		const targetEntities = getTargetEntities({
			ability: this,
			kind: 'harm',
			actor,
			target,
			game,
		});
		if (actor && highlights.help.length) {
			actions.move({
				game,
				actor,
				dx: highlights.help[0].x - actor.x,
				dy: highlights.help[0].y - actor.y,
			});
			for (const entity of targetEntities) {
				actions.attack({ game, actor, target: entity });
			}
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const float: Ability = {
	name: 'float',
	synonyms: ['glide', 'hover'],
	description: 'Float for 10 turns, unaffected by terrain.',
	attributes: { duration: 10 },
	highlight(actor, target, game) {
		if (game.at(target).some((e) => e.statuses)) {
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
					status: 'floating',
					duration: (this.attributes.duration ?? 0) + 1,
				});
			}
			game.playSfx('magic');
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};
