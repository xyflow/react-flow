<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		type NodeTypes,
		type Node,
		type Edge
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	import DebugNode from './DebugNode.svelte';

	const nodeTypes: NodeTypes = {
		default: DebugNode
	};

	let nodes = $state.raw<Node[]>([
		{
			id: '1',
			type: 'input',
			data: { label: 'Node 1' },
			position: { x: 250, y: 5 },
			origin: [0.5, 0.5]
		},
		{
			id: '4',
			data: { label: 'Node 4' },
			position: { x: 100, y: 200 },
			style: 'width:500px; height:300px;'
		},
		{
			id: '4a',
			data: { label: 'Node 4a' },
			position: { x: 15, y: 15 },
			parentId: '4',
			extent: [
				[0, 0],
				[100, 100]
			]
		},
		{
			id: '4b',
			data: { label: 'Node 4b' },
			position: { x: 100, y: 60 },
			style: 'width: 300px; height: 200px;',
			parentId: '4'
		},
		{
			id: '4b1',
			data: { label: 'Node 4b1' },
			position: { x: 40, y: 20 },
			parentId: '4b'
		},
		{
			id: '4b2',
			data: { label: 'Node 4b2' },
			position: { x: 20, y: 100 },
			parentId: '4b'
		},
		{
			id: '5',
			type: 'group',
			data: { label: 'Node 5' },
			position: { x: 650, y: 250 },
			style: 'width: 400px; height: 150px',
			zIndex: 1000
		},
		{
			id: '5a',
			data: { label: 'Node 5a' },
			position: { x: 0, y: 0 },
			parentId: '5',
			extent: 'parent'
		},
		{
			id: '5b',
			data: { label: 'Node 5b' },
			position: { x: 225, y: 50 },
			parentId: '5',
			expandParent: true
		},
		{
			id: '2',
			data: { label: 'Node 2' },
			position: { x: 100, y: 100 }
		},
		{
			id: '3',
			data: { label: 'Node 3' },
			position: { x: 400, y: 100 }
		}
	]);

	let edges = $state.raw<Edge[]>([
		{
			id: 'e1-2',
			source: '1',
			target: '2'
			// markerEnd: {
			//   type: MarkerType.Arrow,
			//   strokeWidth: 2,
			//   width: 15,
			//   height: 15,
			//   color: '#f00',
			// },
		},
		{ id: 'e1-3', source: '1', target: '3' },
		{ id: 'e3-4', source: '3', target: '4' },
		{ id: 'e3-4b', source: '3', target: '4b', zIndex: 100 },
		{ id: 'e4a-4b1', source: '4a', target: '4b1' },
		{ id: 'e4a-4b2', source: '4a', target: '4b2', zIndex: 100 },
		{ id: 'e4b1-4b2', source: '4b1', target: '4b2' }
	]);
</script>

<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView minZoom={0.1} maxZoom={2.5}>
	<Controls />
	<Background variant={BackgroundVariant.Dots} />
	<MiniMap />
</SvelteFlow>

<style>
	:global(.svelte-flow .svelte-flow__node.parent) {
		background-color: rgba(220, 220, 255, 0.4);
	}
</style>
