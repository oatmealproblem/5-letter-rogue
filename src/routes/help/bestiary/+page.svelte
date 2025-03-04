<script lang="ts">
	import type { SetRequired } from 'type-fest';

	import { templates } from '$lib/templates';
	import type { Entity } from '$lib/types';
</script>

<svelte:head><title>Bestiary</title></svelte:head>

{#each Object.values(templates)
	.filter((t): t is SetRequired<Entity, 'name'> => Boolean(t.name && t.ai))
	.toSorted((a, b) => a.name.localeCompare(b.name)) as template (template.name)}
	<section class="card bg-surface-100-900 p-4">
		<h2 class="h4">{template.name}</h2>
		{template.description}
		{#if template.synonyms?.length}
			<div>
				Synonyms: <span class="font-bold">
					{template.synonyms?.join(', ')}
				</span>
			</div>
		{/if}
	</section>
{/each}
