import type { Entity } from '$lib/types';

export function heal({ target, amount }: { target: Entity; amount: number }) {
	if (target.hp && !target.statuses?.poisoned) {
		target.hp.partial = (target.hp.partial ?? 0) + amount;
		const amountToHeal = Math.floor(target.hp.partial);
		target.hp.partial -= amountToHeal;
		target.hp.current = Math.min(target.hp.current + amountToHeal, target.hp.max);
		if (target.hp.current === target.hp.max) {
			target.hp.partial = 0;
		}
		return true;
	}
	return false;
}
