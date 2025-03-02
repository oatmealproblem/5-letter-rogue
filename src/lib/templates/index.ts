import { nanoid } from 'nanoid/non-secure';
import type { SetOptional } from 'type-fest';

import type { Entity, Template } from '$lib/types';

import { enemies } from './enemies';
import { letters } from './letters';
import { terrain } from './terrain';

const templates = {
	...enemies,
	...letters,
	...terrain,
};

export type TemplateId = keyof typeof templates;

const genericTemplates: Record<TemplateId, Template> = templates;
export { genericTemplates as templates };

export function createFromTemplate(template: TemplateId, data: SetOptional<Entity, 'id'>) {
	const { id, ...rest } = data;
	return {
		id: id ?? `${template}-${nanoid(12)}`,
		...structuredClone(templates[template]),
		...rest,
	};
}
