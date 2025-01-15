<script lang="ts">
	import {
		Handle,
		Position,
		useNodeConnections,
		useNodesData,
		type NodeProps
	} from '@xyflow/svelte';
	import { isTextNode, type MyNode } from './+page.svelte';

	let { id }: NodeProps = $props();

	const connections = useNodeConnections({
		id: id,
		handleType: 'target'
	});

	let nodeData = $derived(
		useNodesData<MyNode>(connections.current.map((connection) => connection.source))
	);
	let textNodes = $derived(nodeData.current.filter(isTextNode));
</script>

<div class="custom">
	<Handle type="target" position={Position.Left} />
	<div>incoming texts:</div>

	{#each textNodes as textNode}
		<div>{textNode.data.text}</div>
	{/each}
</div>

<style>
	.custom {
		background-color: #eee;
		padding: 10px;
		border-radius: 10px;
	}
</style>
