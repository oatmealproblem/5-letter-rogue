<script>
	import { playSound } from '../lib/audio';
	import { game } from '../lib/game.svelte';

	let hasGame = $derived(Boolean(game.get('player')));
</script>

<h1 class="h1 mt-8 text-center">5 Letter Rogue</h1>
<div class="card preset-filled-surface-100-900 mx-auto my-4 flex w-96 flex-col gap-2 p-4">
	{#if hasGame}
		<a
			class="btn btn-lg preset-filled-primary-600-400"
			href="#/game"
			onclick={() => playSound('uiClick')}
		>
			Continue
		</a>
	{/if}
	<a
		class="btn btn-lg"
		class:preset-filled-primary-600-400={!hasGame}
		class:preset-filled-secondary-700-300={hasGame}
		href="#/game"
		onclick={() => {
			playSound('uiClick');
			game.new();
		}}
	>
		New Game
	</a>
</div>
