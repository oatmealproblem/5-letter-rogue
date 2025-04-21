import actions from '$lib/actions';
import { getLine, getRay } from '$lib/geo';
import type { Ability } from '$lib/types';

import { getTargetEntities, has } from './utils';

export const shoot: Ability = {
	name: 'shoot',
	synonyms: ['snipe'],
	description: 'Does 10 physical damage to one enemy.',
	attributes: { physicalDamage: 10 },
	highlight(actor, target, game) {
		if (!actor) return { guide: [], harm: [], help: [] };
		const line = getLine(actor, target);
		const hitIndex = line.slice(1).findIndex((pos) => game.at(pos).some((e) => e.hp)) + 1;
		const harm = hitIndex ? [line[hitIndex]] : [];
		const guide = hitIndex ? line.slice(0, hitIndex) : line;
		return { guide, harm, help: [] };
	},
	execute(actor, target, game) {
		game.playSfx('laser');
		for (const pos of this.highlight(actor, target, game).harm) {
			for (const entity of game.at(pos).filter(has('hp'))) {
				actions.damage({
					game,
					target: entity,
					amount: this.attributes.physicalDamage ?? 0,
					type: 'physical',
				});
				game.playVfx('slash', entity);
			}
		}
		return true;
	},
};

export const laser: Ability = {
	name: 'laser',
	description: 'Does 3 magic damage to everything in a beam.',
	attributes: { magicDamage: 3 },
	highlight(actor, target, game) {
		if (!actor) return { guide: [], harm: [], help: [] };
		const guide = getRay(actor, target);
		const harm = guide.slice(1).filter((pos) => game.at(pos).some((e) => e.hp));
		return { guide, harm, help: [] };
	},
	execute(actor, target, game) {
		for (const pos of getTargetEntities({ ability: this, kind: 'harm', actor, target, game })) {
			for (const entity of game.at(pos).filter(has('hp'))) {
				actions.damage({
					game,
					target: entity,
					amount: this.attributes.magicDamage ?? 0,
					type: 'magic',
				});
				game.playVfx('slash', entity);
			}
		}
		game.playSfx('laser');
		return true;
	},
};
