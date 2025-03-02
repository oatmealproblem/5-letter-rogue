import { nanoid } from 'nanoid/non-secure';
import type { SetOptional } from 'type-fest';

import type { Entity } from '$lib/types';

import { enemies } from './enemies';
import { letters } from './letters';

export const templates = {
	...enemies,
	...letters,
};

export type TemplateId = keyof typeof templates;

export function createFromTemplate(template: TemplateId, data: SetOptional<Entity, 'id'>) {
	const { id, ...rest } = data;
	return {
		id: id ?? `${template}-${nanoid(12)}`,
		...structuredClone(templates[template]),
		...rest,
	};
}
