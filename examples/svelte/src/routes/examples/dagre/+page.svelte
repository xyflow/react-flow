<script lang="ts">
	import { SvelteFlow, Background, Position, ConnectionLineType, Panel } from '@xyflow/svelte';
	import type { Edge, Node } from '@xyflow/svelte';
	import dagre from '@dagrejs/dagre';

	import '@xyflow/svelte/dist/style.css';

	import { initialNodes, initialEdges } from './nodes-and-edges';

	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	const nodeWidth = 172;
	const nodeHeight = 36;

	function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
		const isHorizontal = direction === 'LR';
		dagreGraph.setGraph({ rankdir: direction });

		nodes.forEach((node) => {
			dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
		});

		edges.forEach((edge) => {
			dagreGraph.setEdge(edge.source, edge.target);
		});

		dagre.layout(dagreGraph);

		const layoutedNodes = nodes.map((node) => {
			const nodeWithPosition = dagreGraph.node(node.id);

			return {
				...node,
				targetPosition: isHorizontal ? Position.Left : Position.Top,
				sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
				position: {
					x: nodeWithPosition.x - nodeWidth / 2,
					y: nodeWithPosition.y - nodeHeight / 2
				}
			};
		});

		return { nodes: layoutedNodes, edges };
	}

	const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
		initialNodes,
		initialEdges
	);

	let nodes = $state.raw<Node[]>(layoutedNodes);
	let edges = $state.raw<Edge[]>(layoutedEdges);

	function onLayout(direction: string) {
		const layoutedElements = getLayoutedElements(nodes, edges, direction);

		nodes = layoutedElements.nodes;
		edges = layoutedElements.edges;
	}
</script>

<div style="height:100vh;">
	<SvelteFlow
		bind:nodes
		bind:edges
		fitView
		connectionLineType={ConnectionLineType.SmoothStep}
		defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
	>
		<Panel position="top-right">
			<button onclick={() => onLayout('TB')}>vertical layout</button>
			<button onclick={() => onLayout('LR')}>horizontal layout</button>
		</Panel>
		<Background />
	</SvelteFlow>
</div>
