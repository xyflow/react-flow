<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		type Node,
		type Edge
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	const yNodes = 25;
	const xNodes = 25;

	const nodeItems: Node[] = [];
	const edgeItems: Edge[] = [];

	let source = null;

	for (let y = 0; y < yNodes; y++) {
		for (let x = 0; x < xNodes; x++) {
			const position = { x: x * 100, y: y * 50 };
			const id = `${x}-${y}`;
			const data = { label: `Node ${id}` };
			const node = {
				id,
				data,
				position,
				type: 'default',
				selected: true
			};
			nodeItems.push(node);

			if (source) {
				const edge = {
					id: `${source.id}-${id}`,
					source: source.id,
					target: id
				};
				edgeItems.push(edge);
			}

			source = node;
		}
	}

	let nodes = $state.raw(nodeItems);
	let edges = $state.raw(edgeItems);
</script>

<SvelteFlow bind:nodes bind:edges fitView minZoom={0.2} onlyRenderVisibleElements>
	<Controls />
	<Background variant={BackgroundVariant.Lines} />
	<MiniMap />
</SvelteFlow>
