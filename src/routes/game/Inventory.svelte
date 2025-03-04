<script lang="ts">
	import { RNG } from 'rot-js';

	import abilities from '$lib/abilities';
	import { playSound } from '$lib/audio';
	import { LETTERS } from '$lib/constants';
	import { game } from '$lib/game.svelte';
	import { stripPos } from '$lib/geo';
	import { rangeFromTo } from '$lib/math';
	import type { Ability, Letter, Pos } from '$lib/types';

	interface Props {
		spelling: string;
		activeAbility: Ability | null;
		cursorPos: Pos | null;
		executeAbility: () => void;
	}
	let {
		spelling = $bindable(),
		activeAbility = $bindable(),
		cursorPos = $bindable(),
		executeAbility,
	}: Props = $props();

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
			if (!cursorPos && player) {
				cursorPos = stripPos(player);
			}
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
		// escape, cancel
		if ((spelling || activeAbility) && e.key === 'Escape') {
			playSound('uiBack');
			spelling = '';
			activeAbility = null;
		}

		// enter, try to cast
		if (e.key === 'Enter' || e.key === ' ') {
			// audio handled by executeAbility() and cast()
			if (activeAbility) {
				executeAbility();
			} else {
				cast();
			}
		}

		if (!activeAbility) {
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
		}
	}}
/>

<section class="mt-4">
	<h2 class="font-bold">Inventory</h2>
	<div class="mt-1 flex flex-wrap gap-4">
		{#each LETTERS as letter}
			{@const amount = player?.inventory?.[letter] ?? 0}
			{@const upper = letter.toUpperCase()}
			<button
				class="btn relative size-8 {getLetterButtonClass(letter)}"
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
					<span
						class="badge-icon preset-filled-secondary-200-800 absolute -top-2 -right-2 size-5 text-sm"
					>
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
					class="relative inline-block size-8 rounded-full text-center"
					class:font-creature={activeAbility}
					style:line-height={activeAbility ? '1.5rem' : '2.5rem'}
					class:preset-filled-primary-400-600={spelling[i] && i === 0}
					class:preset-filled-primary-500={spelling[i] && i === 1}
					class:preset-filled-primary-600-400={spelling[i] && i === 2}
					class:preset-filled-primary-700-300={spelling[i] && i === 3}
					class:preset-filled-primary-800-200={spelling[i] && i === 4}
					class:preset-filled-surface-500={!spelling[i]}
				>
					{#if activeAbility}
						<span
							class="absolute top-0 left-0 inline-block size-8 animate-pulse rounded-full text-center ring-4"
							class:ring-primary-400-600={spelling[i] && i === 0}
							class:ring-primary-500={spelling[i] && i === 1}
							class:ring-primary-600-400={spelling[i] && i === 2}
							class:ring-primary-700-300={spelling[i] && i === 3}
							class:ring-primary-800-200={spelling[i] && i === 4}
						></span>
					{/if}
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
			Casting: <strong>{activeAbility.name}</strong>
			{#if activeAbility.synonymOf}
				<em>
					(syn. <strong>{activeAbility.synonymOf}</strong>
					)
				</em>
			{/if}
			- {activeAbility.description}
		</p>
	{:else}
		<p class="mt-4">Perhaps...</p>
		{#each suggestions as suggestion (suggestion)}
			<button
				class="mt-1 text-start text-sm"
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
