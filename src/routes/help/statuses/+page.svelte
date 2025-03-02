<script lang="ts">
	import { statusMetadata } from '$lib/statuses';
</script>

<svelte:head><title>Spell Book</title></svelte:head>

{#each Object.entries(statusMetadata).toSorted( (a, b) => a[0].localeCompare(b[0]), ) as [status, meta] (status)}
	<section class="card bg-surface-200-800 p-4">
		<header>
			<h2 class="h4">{status}</h2>
			{meta.description}
		</header>
	</section>
{/each}
