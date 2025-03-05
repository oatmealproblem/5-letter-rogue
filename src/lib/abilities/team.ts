import { inflict } from '$lib/actions/inflict';
import { stripPos } from '$lib/geo';
import type { Ability } from '$lib/types';

import { getTargetEntities } from './utils';

export const charm: Ability = {
	name: 'charm',
	description: 'Convert a creature to your team.',
	synonyms: ['court', 'flirt'],
	attributes: {},
	highlight(actor, target, game) {
		if (game.at(target).some((e) => e.team !== actor?.team && !e.statuses?.loyal)) {
			return { guide: [], harm: [], help: [stripPos(target)] };
		} else {
			return { guide: [stripPos(target)], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ actor, target, game, kind: 'help', ability: this }).filter(
			(e) => e.team !== actor?.team && !e.statuses?.loyal,
		);
		if (targets.length) {
			for (const entity of targets) {
				entity.team = actor?.team;
			}
			game.playSfx('magic');
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const frame: Ability = {
	name: 'frame',
	description: "Turn a creature's allies against them.",
	synonyms: ['blame', 'decry', 'fault', 'judge'],
	attributes: {},
	highlight(actor, target, game) {
		if (game.at(target).some((e) => e.team && e !== actor)) {
			return { guide: [], harm: [stripPos(target)], help: [] };
		} else {
			return { guide: [stripPos(target)], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ actor, target, game, kind: 'harm', ability: this }).filter(
			(e) => e.team !== actor?.team,
		);
		if (targets.length) {
			for (const entity of targets) {
				entity.team = entity.id;
			}
			game.playSfx('magic');
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const thank: Ability = {
	name: 'thank',
	description:
		'Make an ally loyal for 50 turns (they cannot be charmed and will follow across levels)',
	attributes: {},
	highlight(actor, target, game) {
		if (game.at(target).some((e) => e.team === actor?.team && e.statuses && !e?.statuses.loyal)) {
			return { guide: [], harm: [], help: [stripPos(target)] };
		} else {
			return { guide: [stripPos(target)], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ actor, target, game, kind: 'help', ability: this }).filter(
			(e) => e.team === actor?.team && e.statuses && !e?.statuses.loyal,
		);
		if (targets.length) {
			for (const entity of targets) {
				inflict({ target: entity, status: 'loyal', duration: 50 });
			}
			game.playSfx('magic');
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};
