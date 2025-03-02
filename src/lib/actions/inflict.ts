import type { Entity, Status } from '$lib/types';

export function inflict({
	target,
	status,
	duration,
}: {
	target: Entity;
	status: Status;
	duration: number;
}) {
	if (target.statuses) {
		const current = target.statuses[status as Status] ?? 0;
		if (current === true) return true;
		target.statuses[status as Status] = current + duration;
		return true;
	}
	return false;
}
