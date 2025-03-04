<script lang="ts">
	import { RNG } from 'rot-js';

	import abilities from '$lib/abilities';
	import { playSound } from '$lib/audio';
	import { LETTERS } from '$lib/constants';
	import { game } from '$lib/game.svelte';
	import { rangeFromTo } from '$lib/math';
	import type { Ability, Letter } from '$lib/types';

	interface Props {
		spelling: string;
		activeAbility: Ability | null;
	}
	let { spelling = $bindable(), activeAbility = $bindable() }: Props = $props();

	let player = $derived(game.get('player'));

	function validateLetters(value: string) {
		const letterCounts = value.split('').reduce<Map<string, number>>((acc, cur) => {
			acc.set(cur.toLowerCase(), (acc.get(cur.toLowerCase()) ?? 0) + 1);
			return acc;
		}, new Map());
		return (
			value.length <= 5 &&
			letterCounts
				.entries()
				.every(([letter, count]) => (player?.inventory?.[letter as Letter] ?? 0) >= count)
		);
	}

	function getLetterButtonClass(letter: Letter) {
		const inventory = player?.inventory?.[letter] ?? 0;
		const spellingCount = spelling?.split('').filter((l) => l.toLowerCase() === letter).length;
		if (inventory === 0) {
			return 'preset-filled-surface-500';
		} else if (spellingCount === inventory) {
			return 'preset-filled-warning-500';
		} else {
			return 'preset-filled-secondary-500';
		}
	}

	function cast() {
		const lower = spelling?.toLowerCase() ?? '';
		if (lower in abilities) {
			playSound('uiClick');
			activeAbility = abilities[lower as keyof typeof abilities];
		} else {
			playSound('uiError');
		}
	}

	const suggestions = $derived.by(() => {
		const spellable = Object.keys(abilities).filter(validateLetters);
		if (spelling)
			return spellable.filter((word) => word.startsWith(spelling.toLowerCase())).slice(0, 5);
		return RNG.shuffle(spellable).slice(0, 5);
	});
</script>

<svelte:window
	onkeyup={(e) => {
		if (!activeAbility) {
			// escape, cancel
			if (e.key === 'Escape') {
				playSound('uiBack');
				spelling = '';
			}

			// enter, try to cast
			if (e.key === 'Enter' || e.key === ' ') {
				// audio handled by cast()
				cast();
			}

			// typing controls
			if (e.key === 'Backspace') {
				playSound('uiClick');
				spelling = spelling?.slice(0, spelling.length - 1) ?? '';
			} else if (LETTERS.includes(e.key as Letter)) {
				const upper = e.key.toUpperCase();
				if (validateLetters(spelling + upper)) {
					playSound('uiClick');
					spelling += upper;
				} else {
					playSound('uiError');
				}
			}
		} else if (activeAbility) {
			if (e.key === 'Escape') {
				playSound('uiBack');
				spelling = '';
				activeAbility = null;
			}
		}
	}}
/>

<section class="mt-4">
	<div class="flex flex-wrap gap-4">
		{#each LETTERS as letter}
			{@const amount = player?.inventory?.[letter] ?? 0}
			{@const upper = letter.toUpperCase()}
			<button
				class="btn relative size-10 {getLetterButtonClass(letter)}"
				disabled={amount === 0}
				onclick={() => {
					if (spelling == null) {
						playSound('uiClick');
						spelling = upper;
					} else {
						if (validateLetters(spelling + upper)) {
							playSound('uiClick');
							spelling += upper;
						} else {
							playSound('uiError');
						}
					}
					(document.activeElement as HTMLElement)?.blur?.();
				}}
			>
				{upper}
				{#if amount}
					<span class="badge-icon preset-filled-secondary-200-800 absolute -top-2 -right-2">
						{amount}
					</span>
				{/if}
			</button>
		{/each}
	</div>
	<div class="mt-4 flex gap-2">
		<div class="animated flex gap-4 text-2xl">
			{#each rangeFromTo(0, 5) as i}
				<span
					class="	inline-block size-10 rounded-full text-center"
					class:font-creature={activeAbility}
					style:line-height={activeAbility ? '' : '3rem'}
					class:preset-filled-primary-400-600={spelling[i] && i === 0}
					class:preset-filled-primary-500={spelling[i] && i === 1}
					class:preset-filled-primary-600-400={spelling[i] && i === 2}
					class:preset-filled-primary-700-300={spelling[i] && i === 3}
					class:preset-filled-primary-800-200={spelling[i] && i === 4}
					class:preset-filled-surface-500={!spelling[i]}
				>
					{spelling[i] ?? ''}
				</span>
			{/each}
			{#if !activeAbility}
				<button
					class="btn"
					class:preset-filled-primary-900-100={spelling.length === 5}
					class:preset-filled-surface-500={spelling.length !== 5}
					onclick={cast}
				>
					Cast
				</button>
				<button
					class="btn btn-icon hover:preset-tonal-error text-error-700-300"
					onclick={() => {
						playSound('uiClick');
						spelling = '';
						activeAbility = null;
						(document.activeElement as HTMLElement)?.blur?.();
					}}
				>
					✕
				</button>
			{:else}
				<button
					class="btn hover:preset-tonal-error text-error-700-300"
					onclick={() => {
						playSound('uiClick');
						spelling = '';
						activeAbility = null;
						(document.activeElement as HTMLElement)?.blur?.();
					}}
				>
					Cancel
				</button>
			{/if}
		</div>
	</div>
	{#if activeAbility}
		<p class="mt-4">
			Casting: {activeAbility.name}{activeAbility.synonymOf ? ` (${activeAbility.synonymOf})` : ''} -
			{activeAbility.description}
		</p>
	{:else}
		<p class="mt-4">Perhaps...</p>
		{#each suggestions as suggestion (suggestion)}
			<button
				class="mt-2 text-start"
				onclick={() => {
					spelling = suggestion;
					cast();
				}}
			>
				<strong>{suggestion}</strong>
				{#if abilities[suggestion].synonymOf}
					<em>
						(syn. <strong>{abilities[suggestion].synonymOf}</strong>
						)
					</em>
				{/if}
				- {abilities[suggestion].description}
			</button>
		{:else}
			<p>Uh oh, I got nothing</p>
		{/each}
	{/if}
</section>
