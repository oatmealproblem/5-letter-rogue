import { type TemplateId, templates } from '$lib/templates';
import type { Ability } from '$lib/types';

import { blast } from './blast';
import { shoot } from './shoot';
import { createSummonAbility } from './summon';

const abilities: Record<string, Ability> = {
	blast,
	shoot,
};

for (const [templateId] of Object.entries(templates).filter((t) => t[1].ai)) {
	abilities[templateId] = createSummonAbility(templateId as TemplateId);
}

for (const ability of Object.values(abilities)) {
	for (const synonym of ability.synonyms ?? []) {
		abilities[synonym] = {
			...ability,
			name: synonym,
			synonymOf: ability.name,
			synonyms: undefined,
		};
	}
}

export default abilities;
