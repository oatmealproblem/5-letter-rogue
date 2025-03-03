import { isSamePos } from '$lib/geo';
import type { Ability, Pos } from '$lib/types';

export function getHighlightClass(pos: Pos, highlights: ReturnType<Ability['highlight']>) {
	const filterFn = isSamePos(pos);
	if (highlights.harm.some(filterFn)) {
		return 'bg-error-200-800';
	} else if (highlights.help.some(filterFn)) {
		return 'bg-success-50-950';
	} else if (highlights.guide.some(filterFn)) {
		return 'bg-primary-200-800';
	} else {
		return '';
	}
}

export function getHighlightBorderClass(pos: Pos, highlights: ReturnType<Ability['highlight']>) {
	const filterFn = isSamePos(pos);
	if (highlights.harm.some(filterFn)) {
		return 'inset-ring-4 inset-ring-error-200-800';
	} else if (highlights.help.some(filterFn)) {
		return 'inset-ring-4 inset-ring-success-50-950';
	} else if (highlights.guide.some(filterFn)) {
		return 'inset-ring-4 inset-ring-primary-200-800';
	} else {
		return '';
	}
}
