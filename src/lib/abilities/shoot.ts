import actions from '$lib/actions';
import { getLine } from '$lib/geo';
import type { Ability } from '$lib/types';

export const shoot: Ability = {
	name: 'shoot',
	synonyms: ['snipe'],
	description: 'Does 5 physical damage to one enemy.',
	attributes: { physicalDamage: 5 },
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
			for (const entity of game.at(pos)) {
				actions.damage({ game, target: entity, amount: this.attributes.physicalDamage ?? 0 });
			}
		}
		return true;
	},
};
