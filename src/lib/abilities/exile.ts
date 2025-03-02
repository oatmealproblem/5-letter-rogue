import type { Ability } from '$lib/types';

export const exile: Ability = {
	name: 'exile',
	synonyms: ['expel'],
	description: 'Sends a creature to the next level.',
	attributes: { physicalDamage: 3, radius: 1 },
	highlight(actor, target, game) {
		if (game.at(target).some((e) => e.ai)) {
			return { guide: [target], harm: [target], help: [] };
		} else {
			return { guide: [target], harm: [], help: [] };
		}
	},
	execute(actor, target, game) {
		const highlights = this.highlight(actor, target, game);
		if (highlights.harm.length) {
			for (const pos of this.highlight(actor, target, game).harm) {
				for (const entity of game.at(pos)) {
					if (entity.ai) {
						game.remove(entity);
						// TODO send to next level
					}
				}
			}
			if (actor?.player || actor?.ai) game.playSfx('magic');
			return true;
		} else {
			if (actor?.player) game.playSfx('uiError');
			return false;
		}
	},
};
