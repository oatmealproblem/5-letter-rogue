import type { Ability } from '$lib/types';

export const exile: Ability = {
	name: 'exile',
	synonyms: ['expel'],
	description: 'Sends a creature to the next level.',
	attributes: {},
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
						const level = game.get('level');
						if (level?.level) {
							level.level.exiles.push(entity);
						}
						if (actor?.player || actor?.ai) game.playVfx('bad-magic', entity);
						game.playSfx('fall');
					}
				}
			}
			return true;
		} else {
			if (actor?.player) game.playSfx('uiError');
			return false;
		}
	},
};
