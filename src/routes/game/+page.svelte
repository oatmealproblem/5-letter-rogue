<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { quadIn, quadOut } from 'svelte/easing';
	import { SvelteMap } from 'svelte/reactivity';
	import { blur, fly } from 'svelte/transition';

	import actions from '$lib/actions';
	import { playSound } from '$lib/audio';
	import HelpMenu from '$lib/components/HelpMenu.svelte';
	import { MAP_HEIGHT, MAP_WIDTH } from '$lib/constants';
	import { game } from '$lib/game.svelte';
	import { posToString } from '$lib/geo';
	import { rangeFromTo } from '$lib/math';
	import { type Ability, type Entity, type Letter, type Pos } from '$lib/types';

	import Creatures from './Creatures.svelte';
	import Inventory from './Inventory.svelte';
	import StatusBadges from './StatusBadges.svelte';
	import { getHighlightBorderClass, getHighlightClass } from './utils';

	let spelling = $state<string>('');
	let activeAbility = $state.raw<null | Ability>(null);
	let mousePos = $state.raw<null | Pos>(null);
	let player = $derived(game.get('player'));
	let level = $derived(game.get('level')?.level);
	let hovered = $state<null | Entity>(null);
	let highlighted = $derived(
		player && mousePos && activeAbility
			? activeAbility.highlight(player, mousePos, game)
			: { guide: mousePos ? [mousePos] : [], harm: [], help: [] },
	);

	let defeat = $derived(!player);
	let victory = $derived(game.with('team').every((e) => e.team === 'player'));
	let gameOver = $derived(victory || defeat);

	let activeEffects = $state<Map<string, { id: string; type: string; pos: Pos }>>(new SvelteMap());
	let bumps = $state<Map<string, Pos>>(new SvelteMap());
	$effect(() =>
		game.registerVfxHandler((vfx, pos) => {
			const id = `${vfx},${posToString(pos)}`;
			if (vfx.startsWith('bump:')) {
				const id = vfx.split(':')[1];
				bumps.set(id, pos);
				setTimeout(() => bumps.delete(id), 100);
			} else if (!activeEffects.has(vfx)) {
				activeEffects.set(id, { id, type: vfx, pos });
				setTimeout(() => activeEffects.delete(id), 250);
			}
		}),
	);

	function getVfxAttributes(pos: Pos) {
		return {
			class: 'pointer-events-none absolute inline-block text-center transition-all',
			style: `
				top: ${(pos.y / MAP_HEIGHT) * 100}%;
				left: ${(pos.x / MAP_WIDTH) * 100}%;
				width: ${100 / MAP_WIDTH}vmin;
				height: ${100 / MAP_HEIGHT}vmin;
				font-size: ${100 / MAP_WIDTH / 1.5}vmin;
			`,
		};
	}

	function getHealthBarClass(entity: Entity) {
		if (entity.team === 'player') {
			return 'bg-success-300-700';
		} else if (entity.team === 'enemy') {
			return 'bg-error-300-700';
		} else {
			return 'bg-warning-300-700';
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		const player = game.get('player');
		let turnTaken = false;

		if (!activeAbility && !gameOver) {
			if ((e.key === 'ArrowLeft' || e.key === 'A') && player) {
				const attackTarget = game.at({ x: player.x - 1, y: player.y }).find((e) => e.hp);
				if (attackTarget) {
					turnTaken = actions.attack({
						game,
						actor: player,
						target: attackTarget,
					});
				} else {
					turnTaken = actions.move({ game, actor: player, dx: -1, dy: 0 });
				}
			}
			if ((e.key === 'ArrowRight' || e.key === 'D') && player) {
				const attackTarget = game.at({ x: player.x + 1, y: player.y }).find((e) => e.hp);
				if (attackTarget) {
					turnTaken = actions.attack({
						game,
						actor: player,
						target: attackTarget,
					});
				} else {
					turnTaken = actions.move({ game, actor: player, dx: 1, dy: 0 });
				}
			}
			if ((e.key === 'ArrowUp' || e.key === 'W') && player) {
				const attackTarget = game.at({ x: player.x, y: player.y - 1 }).find((e) => e.hp);
				if (attackTarget) {
					turnTaken = actions.attack({
						game,
						actor: player,
						target: attackTarget,
					});
				} else {
					turnTaken = actions.move({ game, actor: player, dx: 0, dy: -1 });
				}
			}
			if ((e.key === 'ArrowDown' || e.key === 'S') && player) {
				const attackTarget = game.at({ x: player.x, y: player.y + 1 }).find((e) => e.hp);
				if (attackTarget) {
					turnTaken = actions.attack({
						game,
						actor: player,
						target: attackTarget,
					});
				} else {
					turnTaken = actions.move({ game, actor: player, dx: 0, dy: 1 });
				}
			}
			if (e.key === 'Z') {
				turnTaken = true;
			}
		}

		if (turnTaken) {
			game.processTurn();
		}
	}}
/>

<Modal
	open={gameOver}
	triggerBase="hidden"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet content()}
		{#if victory && level?.current === level?.max}
			Victory! You have survived the dungeon!
		{:else if victory}
			Floor cleared! All enemies defeated or befriended
		{:else}
			Defeat! You are dead
		{/if}
		{#if victory && level?.current !== level?.max}
			<button
				class="btn preset-filled-primary-500 w-full"
				onclick={() => {
					playSound('uiClick');
					game.nextLevel();
				}}
			>
				Collect letters and descend
			</button>
		{:else}
			<button
				class="btn preset-filled-primary-500 w-full"
				onclick={() => {
					playSound('uiClick');
					game.new();
				}}
			>
				New Game
			</button>
		{/if}
	{/snippet}
</Modal>

<div class="flex flex-wrap justify-center">
	<div class="flex h-screen w-0 max-w-112 shrink grow flex-col p-4">
		{#if player?.hp?.current}
			<section class="flex">
				<h1 class="h6 grow">Floor {level?.current}/{level?.max}</h1>
				<HelpMenu />
			</section>
			<section>
				<span class="text-success-700-300">HP: {player.hp.current}/{player.hp.max}</span>
				<div>
					<StatusBadges entity={player} />
				</div>
			</section>
			<Inventory bind:spelling bind:activeAbility />
		{:else}
			DEAD
		{/if}
	</div>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="bg-surface-50-950 border-surface-100-900 relative flex flex-col overflow-hidden border-x"
		class:animated={true}
		style:width="100vmin"
		style:height="100vmin"
		onmouseleave={() => {
			mousePos = null;
		}}
	>
		{#each rangeFromTo(0, MAP_HEIGHT) as y}
			<div class="flex flex-row">
				{#each rangeFromTo(0, MAP_WIDTH) as x}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<span
						class="{getHighlightClass(
							{ x, y },
							highlighted,
						)} text-surface-300-700 inline-block text-center select-none"
						style:width="{100 / MAP_WIDTH}vmin"
						style:height="{100 / MAP_HEIGHT}vmin"
						style:font-size="{100 / MAP_WIDTH / 1.5}vmin"
						onmouseenter={() => {
							mousePos = { x, y };
						}}
						onclick={() => {
							if (activeAbility && player) {
								const success = activeAbility.execute(player, { x, y }, game);
								if (success) {
									game.processTurn();
									for (const letter of (spelling ?? '').toLowerCase().split('')) {
										if (player?.inventory) {
											player.inventory[letter as Letter] =
												(player.inventory[letter as Letter] ?? 1) - 1;
										}
									}
									spelling = '';
									activeAbility = null;
								}
							}
						}}
						oncontextmenu={(e) => {
							e.preventDefault();
							activeAbility = null;
						}}
					>
						⋅
					</span>
				{/each}
			</div>
		{/each}
		{#each game.with('glyph') as entity (entity.id)}
			<span
				class="pointer-events-none absolute inline-block text-center transition-all {entity.glyph
					.class ?? ''} {getHighlightBorderClass(entity, highlighted)}"
				class:scale-150={hovered === entity}
				style:top="{(((bumps.get(entity.id)?.y ?? entity.y) + entity.y) / 2 / MAP_HEIGHT) * 100}%"
				style:left="{(((bumps.get(entity.id)?.x ?? entity.x) + entity.x) / 2 / MAP_WIDTH) * 100}%"
				style:width="{100 / MAP_WIDTH}vmin"
				style:height="{100 / MAP_HEIGHT}vmin"
				style:font-size="{100 / MAP_WIDTH / 1.5}vmin"
				out:blur
			>
				{entity.glyph?.char}
				{#if entity.hp}
					<span
						class="{getHealthBarClass(entity)} absolute bottom-0 left-[20%] h-1"
						style:width="{(entity.hp.current / entity.hp.max) * 60}%"
					></span>
				{/if}
			</span>
		{/each}
		{#each activeEffects.values() as vfx (vfx.id)}
			{#if vfx.type === 'slash'}
				<span
					{...getVfxAttributes(vfx.pos)}
					class:text-error-500={true}
					class:font-bold={true}
					in:fly|global={{ x: 10, y: -30, easing: quadIn, duration: 250 }}
					out:fly|global={{ x: -10, y: 30, easing: quadOut, duration: 250 }}
				>
					/
				</span>
			{/if}
		{/each}
	</div>
	<div class="flex h-screen w-0 max-w-112 shrink grow flex-col p-4">
		<p>Creatures:</p>
		<Creatures {highlighted} bind:hovered {mousePos} />
	</div>
</div>
