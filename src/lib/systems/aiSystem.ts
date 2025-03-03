import PriorityQueue from 'priorityqueuejs';
import { RNG } from 'rot-js';

import abilities from '$lib/abilities';
import actions from '$lib/actions';
import type { Game } from '$lib/game.svelte';
import {
	CARDINAL_DIRECTIONS,
	getAdjacentPositions,
	getManhattanDistance,
	isOutOfBounds,
	isSamePos,
	posToString,
	stringToPos,
} from '$lib/geo';
import type { Pos } from '$lib/types';

export function aiSystem(game: Game) {
	for (const actor of game.with('ai')) {
		if (!game.get(actor.id)) continue; // killed by previous actions
		if (actor.statuses?.stunned) continue;

		let turnTaken = false;
		for (const aiAbility of actor.ai.abilities) {
			if (aiAbility.currentCooldown <= 0) {
				let success = false;
				if (!aiAbility.countsAsTurn || !turnTaken) {
					success = abilities[aiAbility.ability]?.execute(actor, actor, game);
				}
				if (success) {
					aiAbility.currentCooldown = aiAbility.cooldown;
				}
				if (success && aiAbility.countsAsTurn) {
					turnTaken = true;
				}
			} else {
				aiAbility.currentCooldown--;
			}
		}

		if (!turnTaken && actor.team && actor.attack) {
			const target = game
				.with('team', 'hp')
				.filter(
					(potentialTarget) =>
						!potentialTarget.statuses?.hidden && potentialTarget.team !== actor.team,
				)
				.sort((a, b) => getManhattanDistance(actor, a) - getManhattanDistance(actor, b))[0];
			if (target) {
				if (getManhattanDistance(actor, target) === 1) {
					actions.attack({ game, actor, target });
				} else {
					const path = aStar({
						from: actor,
						to: target,
						getCost: (pos) => {
							if (isOutOfBounds(pos)) return Infinity;
							if (isSamePos(pos, target)) return 1;
							if (game.at(pos).some((e) => e.hp)) {
								return Infinity;
							} else {
								if (actor.statuses?.floating) {
									return 1;
								} else {
									return game.at(pos).reduce((cost, entity) => cost + (entity.aiCost ?? 0), 1);
								}
							}
						},
						includeStart: false,
						includeEnd: false,
					});
					if (path?.length) {
						actions.move({
							game,
							actor: actor,
							dx: path[0].x - actor.x,
							dy: path[0].y - actor.y,
						});
					}
				}
			} else {
				// no target, wander
				if (RNG.getUniform() > 0.5) {
					for (const dir of RNG.shuffle(CARDINAL_DIRECTIONS)) {
						const destination = { x: actor.x + dir.dx, y: actor.y + dir.dy };
						if (!game.at(destination).some((e) => e.aiCost)) {
							actions.move({ game, actor, ...dir });
							break;
						}
					}
				}
			}
		}
	}
}

interface AStarParams {
	from: Pos;
	to: Pos;
	getCost: (pos: Pos) => number;
	includeStart?: boolean;
	includeEnd?: boolean;
	maxCost?: number;
}
function aStar({
	from,
	to,
	getCost,
	includeStart = true,
	includeEnd = true,
	maxCost = 100,
}: AStarParams): null | Pos[] {
	const score: Record<string, number> = {};
	score[posToString(from)] = getManhattanDistance(from, to);

	const distance: Record<string, number> = {};
	distance[posToString(from)] = 0;

	const cameFrom: Record<string, string> = {};

	const queue = new PriorityQueue<string>((a, b) => score[b] - score[a]);
	queue.enq(posToString(from));

	while (!queue.isEmpty()) {
		const current = queue.deq();

		if (current === posToString(to)) {
			const path = [current];
			let previous = cameFrom[current];
			while (previous) {
				path.unshift(previous);
				previous = cameFrom[previous];
			}
			if (!includeStart) path.shift();
			if (!includeEnd && path.length) path.pop();
			return path.map(stringToPos);
		}

		for (const neighbor of getAdjacentPositions(stringToPos(current))) {
			const neighborKey = posToString(neighbor);
			const tentativeScore = distance[current] + getCost(neighbor);
			if (
				tentativeScore < maxCost &&
				Number.isFinite(tentativeScore) &&
				tentativeScore < (Number.isFinite(distance[neighborKey]) ? distance[neighborKey] : Infinity)
			) {
				cameFrom[neighborKey] = current;
				distance[neighborKey] = tentativeScore;
				score[neighborKey] = tentativeScore + getManhattanDistance(neighbor, to);
				queue.enq(neighborKey);
			}
		}
	}

	return null;
}
