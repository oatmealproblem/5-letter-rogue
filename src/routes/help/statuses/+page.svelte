<script lang="ts">
	import { STATUS_METADATA } from '$lib/statuses';
</script>

<svelte:head><title>Spell Book</title></svelte:head>

{#each Object.entries(STATUS_METADATA).toSorted( (a, b) => a[0].localeCompare(b[0]), ) as [status, meta] (status)}
	<section class="card bg-surface-100-900 p-4">
		<h2 class="h4">{status}</h2>
		{meta.description}
	</section>
{/each}
