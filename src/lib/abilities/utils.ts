import type { Game } from '$lib/game.svelte';
import type { Ability, Entity, Pos } from '$lib/types';

export function isEntity(target: Entity | Pos): target is Entity {
	return 'id' in target;
}

export function getTargetEntities({
	ability,
	kind,
	actor,
	target,
	game,
}: {
	ability: Ability;
	kind: 'guide' | 'harm' | 'help';
	actor: Entity | null;
	target: Entity | Pos;
	game: Game;
}) {
	return ability.highlight(actor, target, game)[kind].flatMap((pos) => game.at(pos));
}
