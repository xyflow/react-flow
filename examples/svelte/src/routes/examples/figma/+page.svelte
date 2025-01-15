<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		SelectionMode
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	const onPaneContextMenu = (e: any) => {
		e.preventDefault();
		console.log('context menu');
	};

	const panOnDrag = [1, 2];

	const onMoveStart = (e: any) => console.log('move start', e);
	const onMove = (e: any) => console.log('move', e);
	const onMoveEnd = (e: any) => console.log('move end', e);

	let nodes = $state.raw([
		{
			id: '1',
			type: 'input',
			data: { label: 'Node 1' },
			position: { x: 250, y: 5 },
			className: 'light'
		},
		{ id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 }, className: 'light' },
		{ id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 }, className: 'light' },
		{ id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 }, className: 'light' }
	]);

	let edges = $state.raw([
		{ id: 'e1-2', source: '1', target: '2', animated: true },
		{ id: 'e1-3', source: '1', target: '3' }
	]);
</script>

<SvelteFlow
	bind:nodes
	bind:edges
	fitView
	selectionMode={SelectionMode.Partial}
	selectionOnDrag
	panOnScroll
	{panOnDrag}
	{onMoveStart}
	{onMove}
	{onMoveEnd}
>
	<Controls />
	<Background variant={BackgroundVariant.Dots} />
</SvelteFlow>
