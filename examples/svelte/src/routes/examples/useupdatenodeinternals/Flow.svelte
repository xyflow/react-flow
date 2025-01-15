<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		type NodeTypes,
		useSvelteFlow,
		Panel
	} from '@xyflow/svelte';

	import CustomNode from './CustomNode.svelte';

	import '@xyflow/svelte/dist/style.css';

	const nodeTypes: NodeTypes = {
		custom: CustomNode
	};

	let nodes = $state.raw([
		{
			id: '1',
			type: 'custom',
			data: { label: 'Input Node' },
			position: { x: 150, y: 0 }
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
	]);

	let edges = $state.raw([
		{
			id: '1-2',
			source: '1',
			target: '2'
		},
		{
			id: '1-3',
			source: '1',
			target: '3'
		}
	]);

	const { updateNode } = $derived(useSvelteFlow());

	const updateNodePosition = () => {
		updateNode('1', (node) => ({ position: { x: node.position.x + 10, y: node.position.y } }));
	};
</script>

<main>
	<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView>
		<Controls />
		<Background variant={BackgroundVariant.Dots} />
		<MiniMap />

		<Panel><button onclick={updateNodePosition}>update node</button></Panel>
	</SvelteFlow>
</main>

<style>
	main {
		height: 100%;
		display: flex;
	}
</style>
