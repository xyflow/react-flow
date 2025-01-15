<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		type Node,
		type NodeTypes,
		type Edge
	} from '@xyflow/svelte';
	import SingleHandleNode from './SingleHandleNode.svelte';
	import MultiHandleNode from './MultiHandleNode.svelte';

	import '@xyflow/svelte/dist/style.css';

	const nodeTypes: NodeTypes = {
		single: SingleHandleNode,
		multi: MultiHandleNode
	};

	let nodes = $state.raw<Node[]>([
		{
			id: '1',
			type: 'single',
			data: {},
			position: { x: 0, y: 0 }
		},
		{
			id: '2',
			type: 'single',
			data: {},
			position: { x: 200, y: -100 }
		},
		{
			id: '3',
			type: 'single',
			data: {},
			position: { x: 200, y: 100 }
		},

		{
			id: '4',
			type: 'multi',
			data: {},
			position: { x: 400, y: 0 }
		},
		{
			id: '5',
			type: 'multi',
			data: {},
			position: { x: 600, y: -100 }
		},
		{
			id: '6',
			type: 'multi',
			data: {},
			position: { x: 600, y: 100 }
		}
	]);

	let edges = $state.raw<Edge[]>([
		{
			id: 'e1-2',
			source: '1',
			target: '2'
		},
		{
			id: 'e1-3',
			source: '1',
			target: '3'
		},

		{
			id: 'e4a-5',
			source: '4',
			sourceHandle: 'a',
			target: '5'
		},
		{
			id: 'e4b-5',
			source: '4',
			sourceHandle: 'b',
			target: '6'
		}
	]);
</script>

<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView colorMode="dark">
	<Controls />
	<Background variant={BackgroundVariant.Dots} />
	<MiniMap />
</SvelteFlow>
