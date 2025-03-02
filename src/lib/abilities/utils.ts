import type { Entity, Pos } from '$lib/types';

export function isEntity(target: Entity | Pos): target is Entity {
	return 'id' in target;
}
