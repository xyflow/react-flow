<script lang="ts">
	import { SvelteFlow, Background, Controls, useSvelteFlow } from '@xyflow/svelte';
	import type { Edge, Node } from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	import { initialNodes, initialEdges } from './nodes-and-edges';

	let nodes = $state.raw<Node[]>(initialNodes);
	let edges = $state.raw<Edge[]>(initialEdges);

	const { getIntersectingNodes } = $derived(useSvelteFlow());

	const onNodeDrag = ({ targetNode }) => {
		if (targetNode) {
			const intersections = getIntersectingNodes(targetNode).map((n) => n.id);

			nodes = nodes.map((node) => ({
				...node,
				class: intersections.includes(node.id) ? 'highlight' : ''
			}));
		}
	};
</script>

<div style="height:100vh;">
	<SvelteFlow bind:nodes bind:edges fitView class="intersection-flow" onnodedrag={onNodeDrag}>
		<Background />
		<Controls />
	</SvelteFlow>
</div>

<style>
	:global(.svelte-flow__node.highlight) {
		background-color: #ff0072 !important;
		color: white;
	}

	:global(.intersection-flow .svelte-flow__node) {
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: 700;
		border-radius: 1px;
		border-width: 2px;
		box-shadow: 6px 6px 0 1px rgba(0, 0, 0, 0.7);
	}

	:global(
		.intersection-flow .svelte-flow__node.selected,
		.intersection-flow .svelte-flow__node:hover,
		.intersection-flow .svelte-flow__node:focus
	) {
		box-shadow: 6px 6px 0 1px rgba(0, 0, 0, 0.7);
		background-color: #eee;
	}

	:global(.intersection-flow .svelte-flow__handle) {
		display: none;
	}
</style>
