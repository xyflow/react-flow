<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		MarkerType,
		type Connection,
		type EdgeTypes
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';
	import ButtonEdge from './ButtonEdge.svelte';
	import CustomBezierEdge from './CustomBezierEdge.svelte';

	let nodes = $state.raw([
		{
			id: '1',
			type: 'input',
			data: { label: 'Input 1' },
			position: { x: 250, y: 0 }
		},
		{ id: '2', data: { label: 'Node 2' }, position: { x: 150, y: 100 } },
		{ id: '2a', data: { label: 'Node 2a' }, position: { x: 0, y: 180 } },
		{ id: '2b', data: { label: 'Node 2b' }, position: { x: -40, y: 300 } },
		{ id: '3', data: { label: 'Node 3' }, position: { x: 250, y: 200 } },
		{ id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 300 } },
		{ id: '3a', data: { label: 'Node 3a' }, position: { x: 150, y: 300 } },
		{ id: '5', data: { label: 'Node 5' }, position: { x: 250, y: 400 } },
		{
			id: '6',
			type: 'output',
			data: { label: 'Output 6' },
			position: { x: 50, y: 550 }
		},
		{
			id: '7',
			type: 'output',
			data: { label: 'Output 7' },
			position: { x: 250, y: 550 }
		},
		{
			id: '8',
			type: 'output',
			data: { label: 'Output 8' },
			position: { x: 525, y: 600 }
		},
		{
			id: '9',
			type: 'output',
			data: { label: 'Output 9' },
			position: { x: 675, y: 500 }
		}
	]);

	let edges = $state.raw([
		{
			id: 'e1-2',
			source: '1',
			target: '2',
			label: 'bezier edge (default)'
		},
		{
			id: 'e2-2a',
			source: '2',
			target: '2a',
			type: 'smoothstep',
			label: 'smoothstep edge'
		},
		{
			id: 'e2a-2b',
			source: '2a',
			target: '2b',
			type: 'simplebezier',
			label: 'simple bezier edge'
		},
		{ id: 'e2-3', source: '2', target: '3', type: 'step', label: 'step edge' },
		{
			id: 'e3-4',
			source: '3',
			target: '4',
			type: 'straight',
			label: 'straight edge'
		},
		{
			id: 'e3-3a',
			source: '3',
			target: '3a',
			type: 'straight',
			label: 'label only edge',
			style: 'stroke: none'
		},
		{
			id: 'e3-5',
			source: '4',
			target: '5',
			animated: true,
			label: 'animated styled edge',
			style: 'stroke: red'
		},
		{
			id: 'e5-7',
			source: '5',
			target: '7',
			label: 'label with styled bg',
			labelStyle: 'background: #FFCC00; color: #fff; opacity: 0.7',
			markerEnd: {
				type: MarkerType.ArrowClosed
			}
		},
		{
			id: 'e5-8',
			source: '5',
			target: '8',
			type: 'button'
		},
		{
			id: 'e5-9',
			source: '5',
			target: '9',
			type: 'customBezier',
			label: 'custom bezier'
		},
		{
			id: 'e5-6',
			source: '5',
			target: '6',
			label: 'hi',
			labelStyle: 'background: red; font-weight: 700; padding: 5px;',
			style: 'stroke: #ffcc0'
		}
	]);

	const edgeTypes: EdgeTypes = {
		button: ButtonEdge,
		customBezier: CustomBezierEdge
	};

	function getEdgeId(connection: Connection) {
		return `edge-${connection.source}-${connection.target}}`;
	}

	$inspect(edges);
</script>

<SvelteFlow
	bind:nodes
	bind:edges
	{edgeTypes}
	fitView
	nodeDragThreshold={2}
	onedgecreate={(connection) => {
		console.log('on edge create', connection);

		return {
			...connection,
			id: getEdgeId(connection)
		};
	}}
>
	<Controls />
	<Background variant={BackgroundVariant.Dots} />
	<MiniMap />
</SvelteFlow>
