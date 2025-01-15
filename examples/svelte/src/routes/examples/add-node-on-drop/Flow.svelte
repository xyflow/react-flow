<script lang="ts">
	import {
		SvelteFlow,
		useNodeConnections,
		useSvelteFlow,
		type Edge,
		type Node,
		type OnConnectEnd
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	const initialNodes: Node[] = [
		{
			id: '0',
			type: 'input',
			data: { label: 'Node' },
			position: { x: 0, y: 50 }
		}
	];

	let nodes = $state.raw<Node[]>(initialNodes);
	let edges = $state.raw<Edge[]>([]);

	let connectingNodeId: string | null = $state('0');
	let rect = $state<DOMRectReadOnly>();
	let id = 1;
	const getId = () => `${id++}`;

	const { screenToFlowPosition, flowToScreenPosition } = $derived(useSvelteFlow());

	const connections = useNodeConnections({ id: '0', handleType: 'source' });

	$inspect(connections.current);

	const handleConnectEnd: OnConnectEnd = (event) => {
		if (!connectingNodeId) return;

		// See of connection landed inside the flow pane
		const targetIsPane = (event.target as Partial<Element> | null)?.classList?.contains('svelte-flow__pane');
		if (targetIsPane && 'clientX' in event && 'clientY' in event) {
			const id = getId();
			const position = {
				x: event.clientX,
				y: event.clientY
			};

			const doubleTransformedPosition = flowToScreenPosition(screenToFlowPosition(position));
			console.log(
				'Is transforming in both directions (screen-flow, flow-screen) the same?',
				position.x === doubleTransformedPosition.x && position.y === doubleTransformedPosition.y
			);

			const newNode: Node = {
				id,
				data: { label: `Node ${id}` },
				// project the screen position to pane position
				position: screenToFlowPosition(position),
				// set the origin of the new node so it is centered
				origin: [0.5, 0.0]
			};

			nodes = [...nodes, newNode];

			const newEdge = {
				source: connectingNodeId,
				target: id,
				id: `${connectingNodeId}--${id}`
			};
			edges = [...edges, newEdge];
		}
	};
</script>

<svelte:window />

<div class="wrapper" bind:contentRect={rect}>
	<SvelteFlow
		bind:nodes
		bind:edges
		fitView
		fitViewOptions={{ padding: 2 }}
		onconnectstart={(_, { nodeId }) => {
			// Memorize the nodeId you start draggin a connection line from a node
			connectingNodeId = nodeId;
		}}
		onconnectend={handleConnectEnd}
	/>
</div>

<style>
	:global(.svelte-flow .svelte-flow__handle) {
		width: 30px;
		height: 14px;
		border-radius: 3px;
		background-color: #784be8;
	}

	:global(.svelte-flow .svelte-flow__handle-top) {
		top: -10px;
	}

	:global(.svelte-flow .svelte-flow__handle-bottom) {
		bottom: -10px;
	}

	:global(.svelte-flow .svelte-flow__node) {
		height: 40px;
		width: 150px;
		justify-content: center;
		align-items: center;
		display: flex;
		border-width: 2px;
		font-weight: 700;
	}

	:global(.svelte-flow .svelte-flow__edge path, .svelte-flow__connectionline path) {
		stroke-width: 2;
	}

	.wrapper {
		height: 100vh;
		width: 100vw;
	}
</style>
