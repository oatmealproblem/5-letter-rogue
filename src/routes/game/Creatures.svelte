<script lang="ts">
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';

	import { game } from '$lib/game.svelte';
	import { STATUS_METADATA } from '$lib/statuses';
	import type { Ability, Entity, Pos, Status } from '$lib/types';

	import StatusBadges from './StatusBadges.svelte';
	import { getHighlightClass } from './utils';

	interface Props {
		highlighted: ReturnType<Ability['highlight']>;
		hovered: Entity | null;
		mousePos: Pos | null;
	}

	let { highlighted, hovered = $bindable(), mousePos }: Props = $props();

	let creatures = $derived(game.with('ai'));

	let atCursor = $derived(mousePos ? game.at(mousePos) : []);

	function getHpClass(entity: Entity) {
		if (entity.team === 'player') {
			return 'text-success-700-300';
		} else if (entity.team === 'enemy') {
			return 'text-error-700-300';
		} else {
			return 'text-warning-700-300';
		}
	}

	function getStatusClass(statusType: Status) {
		if (STATUS_METADATA[statusType].classification === 'negative') return 'preset-tonal-error';
		if (STATUS_METADATA[statusType].classification === 'positive') return 'preset-tonal-success';
		return 'preset-tonal-warning';
	}
</script>

<section class="mt-2 shrink overflow-auto">
	<ul onmouseleave={() => (hovered = null)}>
		{#each creatures as creature (creature.id)}
			<li
				class="flex items-center gap-2 text-lg"
				onmouseenter={() => {
					hovered = creature;
				}}
			>
				<Tooltip
					positioning={{ placement: 'top' }}
					contentBase="card text-sm preset-filled p-2"
					openDelay={200}
					closeDelay={200}
					arrow
				>
					{#snippet trigger()}
						<span
							class="{getHighlightClass(creature, highlighted) || 'bg-surface-50-950'} {creature
								.glyph?.class} border-surface-50-950 rounded-sm border-2 px-1 text-2xl"
						>
							{creature.glyph?.char}
						</span>
						{#if creature.hp}
							<span class={getHpClass(creature)}>
								{creature.hp.current}/{creature.hp.max} HP
							</span>
						{/if}
						<span class="capitalize">
							{creature.name}
						</span>
						{#if creature.team === 'player'}
							<span class="text-surface-800-200 text-base">(Friendly)</span>
						{/if}
					{/snippet}
					{#snippet content()}{creature.description}{/snippet}
				</Tooltip>
				<StatusBadges entity={creature} />
			</li>
		{/each}
		{#if atCursor.length}
			<hr class="border-surface-100-900 my-4 border-t" />
		{/if}
		{#each atCursor as entity (entity.id)}
			<li class="text-lg">
				<span class="{entity.glyph?.class} border-surface-50-950 rounded-sm border-2 px-1 text-2xl">
					{entity.glyph?.char}
				</span>
				<span class="capitalize">
					{entity.name}
				</span>
				-
				<span>{entity.description}</span>
				{#if entity.statuses && Object.values(entity.statuses).filter(Boolean).length}
					<ul>
						{#each Object.entries(entity.statuses) as [type, duration]}
							<li class="ps-8">
								<span class="{getStatusClass(type as Status)} badge relative -top-1 capitalize">
									{type}{typeof duration === 'number' ? ` | ${duration}` : ''}
								</span>
								<span>{STATUS_METADATA[type as Status].description}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
</section>
