import type { Status } from './types';

export interface StatusMetadata {
	classification: 'negative' | 'positive';
	description: string;
}

export const STATUS_METADATA: Record<Status, StatusMetadata> = {
	floating: {
		classification: 'positive',
		description: 'Ignore terrain effects',
	},
	immobilized: {
		classification: 'negative',
		description: 'Prevents movement',
	},
	loyal: {
		classification: 'positive',
		description: 'Cannot be charmed',
	},
	poisoned: {
		classification: 'negative',
		description: 'Prevents all healing',
	},
};

export const NEGATIVE_STATUSES: Set<Status> = new Set(
	Object.entries(STATUS_METADATA)
		.filter((entry) => entry[1].classification === 'negative')
		.map((entry) => entry[0] as Status),
);

export const POSITIVE_STATUSES: Set<Status> = new Set(
	Object.entries(STATUS_METADATA)
		.filter((entry) => entry[1].classification === 'negative')
		.map((entry) => entry[0] as Status),
);
