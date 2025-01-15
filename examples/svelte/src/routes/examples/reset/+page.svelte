<script lang="ts">
	import { SvelteFlow, Controls, Background, MiniMap, type Node, type Edge } from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	let nodes = $state.raw<Node[]>([]);
	let edges = $state.raw<Edge[]>([]);

	const resetNodesArray = () => {
		const node1: Node = {
			id: 'c1',
			data: { label: '1' },
			position: { x: 0, y: 0 }
		};

		const node2: Node = {
			id: 'c2',
			data: { label: '2' },
			position: { x: 100, y: 0 }
		};

		nodes = [node1, node2];
	};
</script>

<button onclick={resetNodesArray}> Reset </button>

<div style:height="100vh">
	<SvelteFlow bind:nodes bind:edges fitView>
		<Controls />
		<Background />
		<MiniMap />
	</SvelteFlow>
</div>
