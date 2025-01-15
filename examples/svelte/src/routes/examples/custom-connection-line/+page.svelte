<script lang="ts">
	import { SvelteFlow } from '@xyflow/svelte';
	import { Background, BackgroundVariant, type Edge, type Node } from '@xyflow/svelte';

	import CustomNode from './CustomNode.svelte';
	import ConnectionLine from './ConnectionLine.svelte';

	import '@xyflow/svelte/dist/style.css';

	const nodeTypes = {
		custom: CustomNode
	};

	let nodes = $state.raw<Node[]>([
		{
			id: 'connectionline-1',
			type: 'custom',
			data: { label: 'Node 1' },
			position: { x: 250, y: 5 }
		}
	]);

	let edges = $state.raw<Edge[]>([]);
</script>

<div style="height:100vh;">
	<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView>
		{#snippet connectionLine()}
			<ConnectionLine />
		{/snippet}
		<Background variant={BackgroundVariant.Lines} />
	</SvelteFlow>
</div>

<style>
</style>
