<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import IconBack from 'lucide-svelte/icons/arrow-left';

	import { page } from '$app/state';
	import { playSound } from '$lib/audio';
	import HelpMenu from '$lib/components/HelpMenu.svelte';

	import type { LayoutProps } from './$types';

	const { children }: LayoutProps = $props();
</script>

<div class="bg-surface-100-900 mx-auto flex h-screen w-192 flex-col gap-2">
	<AppBar>
		{#snippet lead()}
			<a href="#/game" onclick={() => playSound('uiClick')} class="btn-icon">
				<IconBack />
			</a>
		{/snippet}
		{#snippet trail()}
			<HelpMenu />
		{/snippet}
		<h1 class="h6">{page.data.title}</h1>
	</AppBar>
	{@render children()}
</div>
