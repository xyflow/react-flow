<script lang="ts">
	import {
		SvelteFlow,
		Background,
		type Edge,
		type Node,
		Position,
		type NodeTypes
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	import CustomNode, { type CustomNodeType } from './CustomNode.svelte';
	import SelectedNodesToolbar from './SelectedNodesToolbar.svelte';

	const nodeTypes: NodeTypes = {
		custom: CustomNode
	};

	const positions = ['top', 'right', 'bottom', 'left'];
	const alignments: ('start' | 'center' | 'end')[] = ['start', 'center', 'end'];

	const initialNodes: CustomNodeType[] = [
		{
			id: 'default-node',
			type: 'custom',
			data: { label: 'toolbar top', toolbarPosition: Position.Top },
			position: { x: 0, y: -200 },
			class: 'react-flow__node-default'
		}
	];

	positions.forEach((position, posIndex) => {
		alignments.forEach((align, alignIndex) => {
			const id = `node-${align}-${position}`;
			initialNodes.push({
				id,
				type: 'custom',
				data: {
					label: `toolbar ${position} ${align}`,
					toolbarPosition: position as Position,
					toolbarAlign: align,
					toolbarVisible: true
				},
				class: 'react-flow__node-default',
				position: { x: posIndex * 300, y: alignIndex * 100 }
			});
		});
	});

	const initialEdges: Edge[] = [];

	let nodes = $state.raw<Node[]>(initialNodes);
	let edges = $state.raw<Edge[]>(initialEdges);
</script>

<div style="height: 100vh;">
	<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView>
		<Background />
		<SelectedNodesToolbar />
	</SvelteFlow>
</div>
