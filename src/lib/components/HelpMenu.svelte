<script>
	import { Popover } from '@skeletonlabs/skeleton-svelte';
	import IconHelp from 'lucide-svelte/icons/circle-help';

	import { playSound } from '../audio';
</script>

<Popover
	onOpenChange={() => playSound('uiClick')}
	positioning={{ placement: 'top' }}
	triggerBase="btn-icon preset-tonal"
	contentBase="card bg-surface-200-800 p-4 space-y-4 shadow-sm shadow-surface-900"
	arrow
	arrowBackground="!bg-surface-200 dark:!bg-surface-800"
>
	{#snippet trigger()}<IconHelp />{/snippet}
	{#snippet content()}
		<ul>
			<li>
				<a onclick={() => playSound('uiClick')} class="anchor" href="#/help/spells">Spell Book</a>
			</li>
			<li>
				<a onclick={() => playSound('uiClick')} class="anchor" href="#/help/bestiary">Bestiary</a>
			</li>
			<li>
				<a onclick={() => playSound('uiClick')} class="anchor" href="#/help/statuses">Statuses</a>
			</li>
		</ul>
	{/snippet}
</Popover>
