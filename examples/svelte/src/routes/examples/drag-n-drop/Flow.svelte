<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		useSvelteFlow,
		type Node
	} from '@xyflow/svelte';
	import Sidebar from './Sidebar.svelte';

	import '@xyflow/svelte/dist/style.css';

	const initialNodes = [
		{
			id: '1',
			type: 'input',
			data: { label: 'Input Node' },
			position: { x: 150, y: 5 }
		},
		{
			id: '2',
			type: 'default',
			data: { label: 'Node' },
			position: { x: 0, y: 150 }
		},
		{
			id: '3',
			type: 'output',
			data: { label: 'Output Node' },
			position: { x: 300, y: 150 }
		}
	];

	let nodes = $state.raw<Node[]>(initialNodes);

	let edges = $state.raw([
		{
			id: '1-2',
			type: 'default',
			source: '1',
			target: '2',
			label: 'Edge Text'
		},
		{
			id: '1-3',
			type: 'smoothstep',
			source: '1',
			target: '3'
		}
	]);

	const { screenToFlowPosition } = $derived(useSvelteFlow());

	const onDragOver = (event: DragEvent) => {
		event.preventDefault();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	};

	const onDrop = (event: DragEvent) => {
		event.preventDefault();

		if (!event.dataTransfer) {
			return null;
		}

		const type = event.dataTransfer.getData('application/svelteflow') || 'default';
		const position = screenToFlowPosition({
			x: event.clientX,
			y: event.clientY
		});
		const newNode: Node = {
			id: `${Math.random()}`,
			type,
			position,
			data: { label: `${type} node` }
		};

		nodes = [...nodes, newNode];
	};

	$inspect(nodes);
</script>

<main>
	<SvelteFlow bind:nodes bind:edges fitView ondragover={onDragOver} ondrop={onDrop}>
		<Controls />
		<Background variant={BackgroundVariant.Dots} />
		<MiniMap />
	</SvelteFlow>
	<Sidebar />
</main>

<style>
	main {
		height: 100%;
		display: flex;
	}
</style>
