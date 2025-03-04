<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<kbd class="bg-surface-100-900 inline-block rounded-sm px-1">
	{@render children()}
</kbd>
