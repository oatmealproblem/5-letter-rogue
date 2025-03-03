import type { Entity } from '$lib/types';

export function heal({ target, amount }: { target: Entity; amount: number }) {
	if (target.hp && !target.statuses?.poisoned) {
		target.hp.current = Math.min(target.hp.current + amount, target.hp.max);
		return true;
	}
	return false;
}
