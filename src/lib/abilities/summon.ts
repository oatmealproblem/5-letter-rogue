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
		highlight(actor, target, game) {
			if (game.at(target).some((e) => e.hp)) {
				return { guide: [target], harm: [], help: [] };
			} else {
				return { guide: [], harm: [], help: [target] };
			}
		},
		execute(actor, target, game) {
			const highlights = this.highlight(actor, target, game);
			if (highlights.help.length) {
				game.add(createFromTemplate(templateId, { x: target.x, y: target.y, team: actor?.team }));
				game.playVfx('good-magic', target);
				game.playSfx('magic');
				return true;
			} else {
				game.playSfx('uiError');
				return false;
			}
		},
	};
}
