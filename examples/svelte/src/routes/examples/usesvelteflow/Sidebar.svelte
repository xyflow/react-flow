<script lang="ts">
	import { useEdges, useNodes, useSvelteFlow, useViewport } from '@xyflow/svelte';

	const {
		zoomIn,
		zoomOut,
		setZoom,
		fitView,
		setCenter,
		setViewport,
		getViewport,
		toObject,
		deleteElements
	} = useSvelteFlow();

	let nodes = useNodes();
	let edges = useEdges();
	let viewport = useViewport();

	const deleteNode = () => {
		//TODO: do we really want to allow this?
		// nodes.shift();
		// nodes = nodes;
	};
</script>

<aside>
	<div class="label">Functions:</div>
	<button onclick={() => zoomIn()}>zoom in</button>
	<button onclick={() => zoomOut({ duration: 1000 })}>zoom out transition</button>
	<button onclick={() => setZoom(2)}>set zoom</button>
	<button onclick={() => fitView()}>fitView</button>
	<button onclick={() => setCenter(0, 0)}>setCenter 0, 0</button>
	<button onclick={() => setViewport({ x: 100, y: 100, zoom: 2 })}>setViewport</button>
	<button onclick={() => console.log(getViewport())}>getViewport</button>

	<button onclick={() => deleteElements({ edges: edges.current.map((edge) => ({ id: edge.id })) })}
		>delete edges</button
	>
	<button onclick={() => deleteElements({ nodes: [{ id: nodes.current[0].id }] })}
		>delete node</button
	>
	<button onclick={() => deleteElements({ nodes: nodes.current.map((node) => ({ id: node.id })) })}
		>deleteElements</button
	>
	<button onclick={() => deleteNode()}>delete via store</button>
	<button
		onclick={() => {
			const { nodes, edges, viewport } = toObject();
			console.log(nodes, edges, viewport);
		}}>toObject</button
	>

	<div class="label">Nodes:</div>
	{#each nodes.current as node (node.id)}
		<div>id: {node.id} | x: {node.position.x.toFixed(1)} y: {node.position.y.toFixed(1)}</div>
	{/each}

	<div class="label">Viewport:</div>
	<div>
		x: {viewport.current.x.toFixed(1)} y: {viewport.current.y.toFixed(1)} zoom: {viewport.current.zoom.toFixed(
			1
		)}
	</div>
</aside>

<style>
	.label {
		font-weight: 700;
		margin: 0.5rem 0 0.25rem 0;
	}

	aside {
		width: 20vw;
		background: #f4f4f4;
		padding: 0.4rem 0.8rem;
		font-size: 12px;
	}

	button {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 12px;
	}
</style>
