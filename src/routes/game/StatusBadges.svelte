<script lang="ts">
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';

	import { STATUS_METADATA } from '$lib/statuses';
	import type { Entity, Status } from '$lib/types';

	interface Props {
		entity: Entity;
	}

	const { entity }: Props = $props();

	function getStatusClass(statusType: Status) {
		if (STATUS_METADATA[statusType].classification === 'negative') return 'preset-tonal-error';
		if (STATUS_METADATA[statusType].classification === 'positive') return 'preset-tonal-success';
		return 'preset-tonal-warning';
	}
</script>

<div class="inline-flex gap-2">
	{#if entity.statuses}
		{#each Object.entries(entity.statuses) as [type, duration] (type)}
			<Tooltip
				positioning={{ placement: 'top' }}
				triggerBase="{getStatusClass(type as Status)} badge capitalize"
				contentBase="card text-sm preset-filled p-2"
				openDelay={200}
				closeDelay={200}
				arrow
			>
				{#snippet trigger()}{type}{typeof duration === 'number' ? ` | ${duration}` : ''}{/snippet}
				{#snippet content()}{STATUS_METADATA[type as Status].description}{/snippet}
			</Tooltip>
		{/each}{/if}
</div>
