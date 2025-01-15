<script lang="ts">
	import {
		Handle,
		Position,
		useNodeConnections,
		useNodesData,
		useSvelteFlow,
		type Node,
		type NodeProps
	} from '@xyflow/svelte';
	import { isTextNode, type MyNode } from './+page.svelte';
	import { untrack } from 'svelte';

	let { id, data }: NodeProps<Node<{ text: string }>> = $props();

	const { updateNodeData } = useSvelteFlow();
	const connections = useNodeConnections({
		id: id,
		handleType: 'target'
	});

	let nodeData = $derived(useNodesData<MyNode>(connections.current[0]?.source));
	let textNodeData = $derived(isTextNode(nodeData.current) ? nodeData.current.data : null);

	// For some reason adding an inspect here also prevents the inifinte loop!?
	// $inspect(textNodeData);

	$effect.pre(() => {
		const nodeData = textNodeData;
		const input = nodeData?.text.toUpperCase() ?? '';

		// TODO: We need to add this check to prevent infinite loop
		// I don't understand why?
		if (input === untrack(() => data.text)) return;

		updateNodeData(id, { text: input });
		console.log('updatedNodeData with', input);
	});
</script>

<div class="custom">
	<Handle type="target" position={Position.Left} isConnectable={connections.current.length === 0} />
	<div>uppercase transform</div>
	<Handle type="source" position={Position.Right} />
</div>

<style>
	.custom {
		background-color: #eee;
		padding: 10px;
		border-radius: 10px;
	}
</style>
