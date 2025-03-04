export function rangeFromTo(from: number, to: number, { inclusive = false } = {}) {
	return Array.from({ length: to - from + (inclusive ? 1 : 0) }).map((_, i) => from + i);
}

const fibMemo: Record<number, number> = {};
export function fib(value: number): number {
	if (value === 0) return 0;
	if (value === 1) return 1;
	if (fibMemo[value]) return fibMemo[value];
	const result = fib(value - 1) + fib(value - 2);
	fibMemo[value] = result;
	return result;
}
