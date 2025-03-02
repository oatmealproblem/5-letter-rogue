import { createFromTemplate, type TemplateId, templates } from '$lib/templates';
import type { Ability } from '$lib/types';

export function createSummonAbility(templateId: TemplateId): Ability {
	const template = templates[templateId];
	return {
		summon: true,
		name: template.name ?? '',
		synonyms: template.synonyms,
		description: `Summons friendly ${template.name}. ${template.description}`,
		attributes: {},
		highlight(actor, targetPos, game) {
			if (game.at(targetPos).some((e) => e.hp)) {
				return { guide: [targetPos], harm: [], help: [] };
			} else {
				return { guide: [], harm: [], help: [targetPos] };
			}
		},
		execute(actor, targetPos, game) {
			const highlights = this.highlight(actor, targetPos, game);
			if (highlights.help.length) {
				game.add(
					createFromTemplate(templateId, { x: targetPos.x, y: targetPos.y, team: actor.team }),
				);
				game.playSfx('magic');
				return true;
			} else {
				game.playSfx('uiError');
				return false;
			}
		},
	};
}
