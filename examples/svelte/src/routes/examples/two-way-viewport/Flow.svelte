<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		Panel,
		useSvelteFlow,
		type Viewport
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	let nodes = $state.raw([
		{
			id: 'A',
			position: { x: 0, y: 0 },
			data: { label: 'A' }
		},
		{ id: 'B', position: { x: 0, y: 100 }, data: { label: 'B' } }
	]);

	let edges = $state.raw([{ id: 'ab', source: 'A', target: 'B' }]);
	let viewport = $state<Viewport>({ x: 100, y: 100, zoom: 5 });

	const { fitView } = $derived(useSvelteFlow());

	const updateViewport = () => {
		viewport.x += 10;
	};

	$inspect(viewport);
</script>

<SvelteFlow bind:nodes bind:edges bind:viewport>
	<Controls />
	<Background variant={BackgroundVariant.Dots} />

	<Panel>
		<button onclick={updateViewport}>update viewport</button>
		<button onclick={() => fitView()}>fitView</button>
	</Panel>
</SvelteFlow>
