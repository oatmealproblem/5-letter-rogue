import { type TemplateId, templates } from '$lib/templates';
import type { Ability, Letter } from '$lib/types';

import { blast } from './blast';
import { exile } from './exile';
import * as nonPlayerAbilities from './nonPlayer';
import { shoot } from './shoot';
import { createSummonAbility } from './summon';

const abilities: Record<string, Ability> = {
	...nonPlayerAbilities,
	blast,
	exile,
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

export const letterWeights: Partial<Record<Letter, number>> = {};
for (const key of Object.keys(abilities).filter((key) => key.length === 5)) {
	for (const letter of key.split('')) {
		letterWeights[letter as Letter] = (letterWeights[letter as Letter] ?? 0) + 1;
	}
}
