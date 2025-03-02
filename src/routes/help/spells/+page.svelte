<script lang="ts">
	import abilities from '$lib/abilities';
</script>

<svelte:head><title>Spell Book</title></svelte:head>

{#each Object.values(abilities)
	.filter((a) => !a.synonymOf && !a.summon)
	.toSorted((a, b) => a.name.localeCompare(b.name)) as ability (ability.name)}
	<section class="card bg-surface-200-800 p-4">
		<header>
			<h2 class="h4 uppercase">{ability.name}</h2>
			{ability.description}
			{#if ability.synonyms?.length}
				<div>
					Synonyms: <span class="font-bold">
						{ability.synonyms?.map((a) => a.toUpperCase()).join(', ')}
					</span>
				</div>
			{/if}
		</header>
	</section>
{/each}
