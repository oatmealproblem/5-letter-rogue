import actions from '$lib/actions';
import { getEuclideanDistance, getLine } from '$lib/geo';
import type { Ability } from '$lib/types';

import { getTargetEntities, has } from './utils';

export const lunge: Ability = {
	name: 'lunge',
	synonyms: ['barge', 'blitz', 'crash'],
	description:
		'move up to 3 spaces toward an enemy, attacking and dealing bonus damage equal to the distance moved',
	attributes: {
		radius: 4,
	},
	highlight(actor, target, game) {
		if (!actor) return { guide: [], harm: [], help: [] };
		const line = getLine(actor, target).filter(
			(pos) => Math.round(getEuclideanDistance(actor, pos)) <= (this.attributes.radius ?? 0),
		);
		const hitIndex = line.slice(1).findIndex((pos) => game.at(pos).some((e) => e.hp)) + 1;
		const harm = hitIndex ? [line[hitIndex]] : [];
		const guide = hitIndex ? line.slice(0, hitIndex) : line;
		const help =
			hitIndex && !game.at(line[hitIndex - 1]).some(has('hp')) ? [line[hitIndex - 1]] : [];
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
			const distance = Math.round(getEuclideanDistance(actor, highlights.help[0]));
			actions.move({
				game,
				actor,
				dx: highlights.help[0].x - actor.x,
				dy: highlights.help[0].y - actor.y,
			});
			for (const entity of targetEntities) {
				actions.attack({ game, actor, target: entity, bonusDamage: distance });
			}
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const slice: Ability = {
	name: 'slice',
	synonyms: ['slash'],
	description: 'Attack up to 3 adjacent enemies and inflict 2 turns of bleeding',
	attributes: {
		duration: 2,
	},
	highlight(actor, target, game) {
		if (!actor) return { guide: [], harm: [], help: [] };
		const line = getLine(actor, target).filter(
			(pos) => Math.round(getEuclideanDistance(actor, pos)) === 1,
		);
		const pos = line[0];
		if (!pos) return { guide: [], harm: [], help: [] };
		const dx = pos.x - actor.x;
		const dy = pos.y - actor.y;
		const guide =
			dx && dy
				? [pos, { x: pos.x, y: actor.y }, { x: actor.x, y: pos.y }]
				: dx
					? [pos, { x: pos.x, y: pos.y + 1 }, { x: pos.x, y: pos.y - 1 }]
					: [pos, { x: pos.x + 1, y: pos.y }, { x: pos.x - 1, y: pos.y }];
		const harm = guide.filter((pos) => game.at(pos).some((e) => e.hp));
		return { guide, harm, help: [] };
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'harm', actor, target, game }).filter(
			has('hp'),
		);
		if (actor && targets.length) {
			for (const pos of targets) {
				for (const entity of game.at(pos)) {
					actions.attack({
						game,
						actor,
						target: entity,
						bonusDamage: -1, // to compensate for bleed
					});
					actions.inflict({
						target: entity,
						status: 'bleeding',
						duration: (this.attributes.duration ?? 0) + 1,
					});
				}
			}
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const wound: Ability = {
	name: 'wound',
	synonyms: ['carve', 'gouge', 'shank', 'shred'],
	description: 'Attack an enemy and inflict 5 turns of bleeding',
	attributes: {
		duration: 5,
	},
	highlight(actor, target, game) {
		if (!actor) return { guide: [], harm: [], help: [] };
		const line = getLine(actor, target).filter(
			(pos) => Math.round(getEuclideanDistance(actor, pos)) === 1,
		);
		const pos = line[0];
		if (!pos) return { guide: [], harm: [], help: [] };
		const guide = [pos];
		const harm = guide.filter((pos) => game.at(pos).some((e) => e.hp));
		return { guide, harm, help: [] };
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'harm', actor, target, game }).filter(
			has('hp'),
		);
		if (actor && targets.length) {
			for (const pos of targets) {
				for (const entity of game.at(pos)) {
					actions.attack({
						game,
						actor,
						target: entity,
						bonusDamage: -1, // to compensate for bleed
					});
					actions.inflict({
						target: entity,
						status: 'bleeding',
						duration: (this.attributes.duration ?? 0) + 1,
					});
				}
			}
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const brawl: Ability = {
	name: 'brawl',
	synonyms: ['punch', 'melee', 'smack'],
	description: 'Attack an enemy and stun them for a turn',
	attributes: {
		duration: 1,
	},
	highlight(actor, target, game) {
		if (!actor) return { guide: [], harm: [], help: [] };
		const line = getLine(actor, target).filter(
			(pos) => Math.round(getEuclideanDistance(actor, pos)) === 1,
		);
		const pos = line[0];
		if (!pos) return { guide: [], harm: [], help: [] };
		const guide = [pos];
		const harm = guide.filter((pos) => game.at(pos).some((e) => e.hp));
		return { guide, harm, help: [] };
	},
	execute(actor, target, game) {
		const targets = getTargetEntities({ ability: this, kind: 'harm', actor, target, game }).filter(
			has('hp'),
		);
		if (actor && targets.length) {
			for (const pos of targets) {
				for (const entity of game.at(pos)) {
					actions.attack({
						game,
						actor,
						target: entity,
					});
					actions.inflict({
						target: entity,
						status: 'stunned',
						duration: (this.attributes.duration ?? 0) + 1,
					});
				}
			}
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};

export const shove: Ability = {
	name: 'shove',
	synonyms: ['crush', 'pound', 'smash'],
	description: 'Attack an enemy and push up to 2 spaces back',
	attributes: {},
	highlight(actor, target, game) {
		if (!actor) return { guide: [], harm: [], help: [] };
		const line = getLine(actor, target).filter((pos) => {
			const distance = Math.round(getEuclideanDistance(actor, pos));
			return distance >= 1 && distance <= 3;
		});
		const pos = line[0];
		if (!pos) return { guide: [], harm: [], help: [] };
		const harm = line.filter((pos) => game.at(pos).some((e) => e.hp));
		const guide = harm.length ? line.slice(1) : [pos];
		return { guide, harm, help: [] };
	},
	execute(actor, target, game) {
		const highlights = this.highlight(actor, target, game);
		const targets = getTargetEntities({ ability: this, kind: 'harm', actor, target, game }).filter(
			has('hp'),
		);
		if (actor && targets.length) {
			for (const pos of targets) {
				for (const entity of game.at(pos)) {
					actions.attack({
						game,
						actor,
						target: entity,
					});
					for (const pos of highlights.guide) {
						const dx = pos.x - entity.x;
						const dy = pos.y - entity.y;
						const moved = actions.move({ game, actor: entity, dx, dy });
						if (!moved || !game.get(entity.id)) break; // hit something, died, fell in a pit, etc
					}
				}
			}
			return true;
		} else {
			game.playSfx('uiError');
			return false;
		}
	},
};
