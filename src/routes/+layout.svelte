<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>5 Letter Rogue</title>
</svelte:head>

{@render children()}
