<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { quadIn, quadOut } from 'svelte/easing';
	import { SvelteMap } from 'svelte/reactivity';
	import { blur, fly, scale } from 'svelte/transition';

	import actions from '$lib/actions';
	import { playSound } from '$lib/audio';
	import HelpMenu from '$lib/components/HelpMenu.svelte';
	import { MAP_HEIGHT, MAP_WIDTH } from '$lib/constants';
	import { game } from '$lib/game.svelte';
	import { posToString, stripPos } from '$lib/geo';
	import { rangeFromTo } from '$lib/math';
	import { type Ability, type Entity, type Letter, type Pos } from '$lib/types';

	import Creatures from './Creatures.svelte';
	import Inventory from './Inventory.svelte';
	import Kbd from './Kbd.svelte';
	import StatusBadges from './StatusBadges.svelte';
	import { getHighlightBorderClass, getHighlightClass } from './utils';

	let spelling = $state<string>('');
	let activeAbility = $state.raw<null | Ability>(null);
	let arrowsMoveCursor = $state(false); // what do arrows move
	let cursorPos = $state<null | Pos>(null);
	let cursorPosSetByMouse = $state(false);
	let player = $derived(game.get('player'));
	let level = $derived(game.get('level')?.level);
	let hovered = $state<null | Entity>(null);
	let highlighted = $derived(
		player && cursorPos && activeAbility
			? activeAbility.highlight(player, cursorPos, game)
			: { guide: cursorPos ? [cursorPos] : [], harm: [], help: [] },
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
				setTimeout(() => activeEffects.delete(id), vfx === 'slash' ? 250 : 50);
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

	function executeAbility() {
		if (activeAbility && player && cursorPos) {
			const success = activeAbility.execute(player, stripPos(cursorPos), game);
			if (success) {
				game.processTurn();
				for (const letter of (spelling ?? '').toLowerCase().split('')) {
					if (player?.inventory) {
						player.inventory[letter as Letter] = (player.inventory[letter as Letter] ?? 1) - 1;
					}
				}
				spelling = '';
				activeAbility = null;
				if (!cursorPosSetByMouse && !arrowsMoveCursor) {
					cursorPos = null;
				}
			}
		}
	}
</script>

<svelte:head>
	<title>5 Letter Rogue</title>
</svelte:head>

<svelte:window
	onkeydown={(e) => {
		const player = game.get('player');
		let turnTaken = false;

		const handleDir = ({ dx, dy }: { dx: number; dy: number }) => {
			if (player) {
				if (activeAbility || arrowsMoveCursor) {
					cursorPosSetByMouse = false;
					if (cursorPos) {
						cursorPos.x += dx;
						cursorPos.y += dy;
					} else {
						cursorPos = { x: player.x + dx, y: player.y + dy };
					}
				} else {
					const attackTarget = game.at({ x: player.x + dx, y: player.y + dy }).find((e) => e.hp);
					if (attackTarget) {
						turnTaken = actions.attack({
							game,
							actor: player,
							target: attackTarget,
						});
					} else {
						turnTaken = actions.move({ game, actor: player, dx, dy });
					}
				}
			}
		};

		if (!gameOver) {
			if ((e.key === 'ArrowLeft' || e.key === 'A' || (activeAbility && e.key === 'a')) && player) {
				handleDir({ dx: -1, dy: 0 });
			}
			if ((e.key === 'ArrowRight' || e.key === 'D' || (activeAbility && e.key === 'd')) && player) {
				handleDir({ dx: 1, dy: 0 });
			}
			if ((e.key === 'ArrowUp' || e.key === 'W' || (activeAbility && e.key === 'w')) && player) {
				handleDir({ dx: 0, dy: -1 });
			}
			if ((e.key === 'ArrowDown' || e.key === 'S' || (activeAbility && e.key === 's')) && player) {
				handleDir({ dx: 0, dy: 1 });
			}
			if (e.key === 'Z' || e.key === '.') {
				turnTaken = true;
			}
			if (e.key === '/' || e.key === '?') {
				e.preventDefault();
				arrowsMoveCursor = !arrowsMoveCursor;
				if (arrowsMoveCursor && player) cursorPos = stripPos(player);
			}
			if (e.key === 'Escape') {
				arrowsMoveCursor = false;
				if (!cursorPosSetByMouse) {
					cursorPos = null;
				}
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
		{#if victory && (level?.current ?? 1) >= (level?.max ?? 1)}
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
	<div class="flex h-screen w-0 shrink grow flex-col overflow-auto p-4">
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
			<Inventory bind:spelling bind:activeAbility bind:cursorPos {executeAbility} />
			<section class="mt-4">
				<h2 class="text-lg font-bold">Controls</h2>
				<ul class="flex flex-col gap-1 text-sm">
					{#if activeAbility}
						<li>
							<Kbd>esc</Kbd>
							to cancel
						</li>
						<li>
							<Kbd>space</Kbd>
							or
							<Kbd>enter</Kbd>
							to confirm
						</li>
						<li>
							<Kbd>arrows</Kbd>
							or
							<Kbd>wasd</Kbd>
							to move target
						</li>
					{:else}
						<li><Kbd>a-z</Kbd> to "spell"</li>
						<li>
							<Kbd>esc</Kbd>
							to clear
						</li>
						<li>
							<Kbd>space</Kbd>
							or
							<Kbd>enter</Kbd>
							to cast
						</li>
						<li>
							<Kbd>.</Kbd>
							or
							<Kbd>shift+z</Kbd>
							to skip turn
						</li>
						<li>
							<Kbd>arrows</Kbd>
							or
							<Kbd>shift+wasd</Kbd>
							to move {arrowsMoveCursor ? 'cursor' : 'player'}
						</li>
						<li>
							<Kbd>?</Kbd>
							to toggle inspector mode (arrows move cursor, useful for inspecting creatures if playing
							with keyboard only)
						</li>
					{/if}
				</ul>
			</section>
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
			cursorPos = null;
			cursorPosSetByMouse = true;
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
							cursorPos = { x, y };
							cursorPosSetByMouse = true;
						}}
						onclick={executeAbility}
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
		{#if cursorPos}
			<span
				class="border-surface-950-50 pointer-events-none absolute z-100 inline-block border text-center"
				style:top="{(cursorPos.y / MAP_HEIGHT) * 100}%"
				style:left="{(cursorPos.x / MAP_WIDTH) * 100}%"
				style:width="{100 / MAP_WIDTH}vmin"
				style:height="{100 / MAP_HEIGHT}vmin"
				style:font-size="{100 / MAP_WIDTH / 1.5}vmin"
				out:blur
			></span>
		{/if}
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
			{#if vfx.type === 'good-magic'}
				<span
					{...getVfxAttributes(vfx.pos)}
					style:font-family="Kablammo"
					class:z-100={true}
					class:text-secondary-500={true}
					out:scale|global={{ start: 2, opacity: 0, duration: 1000 }}
				>
					✨
				</span>
			{/if}
			{#if vfx.type === 'bad-magic'}
				<span
					{...getVfxAttributes(vfx.pos)}
					style:font-family="Kablammo"
					class:z-100={true}
					class:text-error-500={true}
					out:scale|global={{ start: 2, opacity: 0, duration: 1000 }}
				>
					
				</span>
			{/if}
		{/each}
	</div>
	<div class="flex h-screen w-0 shrink grow flex-col p-4">
		<p>Creatures:</p>
		<Creatures {highlighted} bind:hovered mousePos={cursorPos} />
	</div>
</div>
