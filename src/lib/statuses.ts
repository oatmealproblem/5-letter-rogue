import type { Status } from './types';

export interface StatusMetadata {
	classification: 'negative' | 'positive';
	description: string;
}

export const statusMetadata: Record<Status, StatusMetadata> = {
	immobilized: {
		classification: 'negative',
		description: 'Prevents movement',
	},
	poisoned: {
		classification: 'negative',
		description: 'Prevents all healing',
	},
};
