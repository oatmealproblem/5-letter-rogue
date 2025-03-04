import type { Status } from './types';

export interface StatusMetadata {
	classification: 'negative' | 'positive';
	description: string;
}

export const STATUS_METADATA: Record<Status, StatusMetadata> = {
	armored: {
		classification: 'positive',
		description: 'Reduce physical damage by 1',
	},
	bleeding: {
		classification: 'negative',
		description: 'Take 1 damage every turn',
	},
	dodging: {
		classification: 'positive',
		description: 'Evade all attacks (but not abilities)',
	},
	floating: {
		classification: 'positive',
		description: 'Ignore terrain effects',
	},
	hidden: {
		classification: 'positive',
		description: 'Invisible to enemies and deal double damage (then lose hidden)',
	},
	immobilized: {
		classification: 'negative',
		description: 'Prevents movement (can still attack and perform abilities)',
	},
	loyal: {
		classification: 'positive',
		description: 'Cannot be charmed',
	},
	regen: {
		classification: 'positive',
		description: 'Heals 10% every turn',
	},
	'regen+': {
		classification: 'positive',
		description: 'Heals 25% every turn',
	},
	poisoned: {
		classification: 'negative',
		description: 'Prevents all healing',
	},
	stunned: {
		classification: 'negative',
		description: 'Cannot act and takes double damage from attacks',
	},
};

export const NEGATIVE_STATUSES: Set<Status> = new Set(
	Object.entries(STATUS_METADATA)
		.filter((entry) => entry[1].classification === 'negative')
		.map((entry) => entry[0] as Status),
);

export const POSITIVE_STATUSES: Set<Status> = new Set(
	Object.entries(STATUS_METADATA)
		.filter((entry) => entry[1].classification === 'positive')
		.map((entry) => entry[0] as Status),
);
