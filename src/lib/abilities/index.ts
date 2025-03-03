import { type TemplateId, templates } from '$lib/templates';
import type { Ability, Letter } from '$lib/types';

import { blast } from './blast';
import { exile } from './exile';
import * as healingAbilities from './healing';
import * as letterAbilities from './letter';
import * as movementAbilities from './movement';
import * as nonPlayerAbilities from './nonPlayer';
import * as rangedAbilities from './ranged';
import * as sneakAbilities from './sneak';
import { createSummonAbility } from './summon';
import * as teamAbilities from './team';

const abilities: Record<string, Ability> = {
	...nonPlayerAbilities,
	...healingAbilities,
	...teamAbilities,
	...movementAbilities,
	...letterAbilities,
	...rangedAbilities,
	...sneakAbilities,
	blast,
	exile,
};

for (const [templateId] of Object.entries(templates).filter((t) => t[1].ai)) {
	if (abilities[templateId]) throw new Error(`Duplicate ability: ${templateId}`);
	abilities[templateId] = createSummonAbility(templateId as TemplateId);
}

for (const ability of Object.values(abilities)) {
	for (const synonym of ability.synonyms ?? []) {
		if (abilities[synonym]) throw new Error(`Duplicate ability: ${synonym}`);
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
