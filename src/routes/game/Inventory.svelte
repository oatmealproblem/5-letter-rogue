<script lang="ts">
	import abilities from '$lib/abilities';
	import { playSound } from '$lib/audio';
	import { LETTERS } from '$lib/constants';
	import { game } from '$lib/game.svelte';
	import type { Ability, Letter } from '$lib/types';

	interface Props {
		spelling: string | null;
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

	let input = $state<HTMLInputElement | undefined>(undefined);

	function cast() {
		const lower = spelling?.toLowerCase() ?? '';
		if (lower in abilities) {
			playSound('uiClick');
			activeAbility = abilities[lower as keyof typeof abilities];
		} else {
			playSound('uiError');
		}
	}
</script>

<svelte:window
	onkeyup={(e) => {
		if (spelling != null && !activeAbility) {
			// escape, cancel
			if (e.key === 'Escape') {
				playSound('uiBack');
				spelling = null;
			}

			// enter, try to cast
			if (e.key === 'Enter') {
				// audio handled by cast()
				cast();
			}

			// typing controls when input isn't focused
			if (!input?.isSameNode(document.activeElement)) {
				if (e.key === 'Backspace') {
					playSound('uiClick');
					spelling = spelling?.slice(0, spelling.length - 1) ?? '';
				} else if (LETTERS.includes(e.key.toLowerCase() as Letter)) {
					const upper = e.key.toUpperCase();
					if (validateLetters(spelling + upper)) {
						playSound('uiClick');
						spelling += upper;
					} else {
						playSound('uiError');
					}
				}
			}
		} else if (activeAbility) {
			if (e.key === 'Escape') {
				playSound('uiBack');
				spelling = null;
				activeAbility = null;
			}
		} else {
			if (e.key === 'e') {
				playSound('uiClick');
				spelling = '';
			}
		}
	}}
/>

<section class="mt-4">
	<div class="flex gap-2">
		{#if activeAbility}
			Casting: {activeAbility.name} - {activeAbility.description}
		{:else if spelling != null}
			<!-- svelte-ignore a11y_autofocus -->
			<input
				autofocus
				class="input bg-primary-50-950 w-24 tracking-[0.25em] uppercase"
				bind:this={input}
				bind:value={
					() => spelling,
					(value) => {
						if (validateLetters(value ?? '')) {
							playSound('uiClick');
							spelling = value ?? '';
						} else {
							playSound('uiError');
						}
					}
				}
			/>
			<button class="btn preset-filled-primary-500" onclick={cast}>Cast Spell</button>
			<button
				class="btn btn-icon hover:preset-tonal-error text-error-700-300"
				onclick={() => {
					playSound('uiClick');
					spelling = null;
				}}
			>
				✕
			</button>
		{:else}
			<button
				class="btn preset-filled-primary-500"
				onclick={() => {
					playSound('uiClick');
					spelling = '';
				}}
			>
				Spell
			</button>
		{/if}
	</div>
	<div class="mt-4 flex flex-wrap gap-4">
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
</section>
