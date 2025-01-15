<script lang="ts">
	import { Handle, Position, type NodeProps, useSvelteFlow } from '@xyflow/svelte';

	let { id, data }: NodeProps = $props();

	const { updateNodeData } = useSvelteFlow();
</script>

<div class="custom">
	<div>node {id}</div>
	<div>
		<input
			value={data.text}
			oninput={(evt) => updateNodeData(id, { text: evt.currentTarget.value })}
		/>
	</div>
	<Handle type="source" position={Position.Right} />
</div>

<style>
	.custom {
		background-color: #eee;
		padding: 10px;
		border-radius: 10px;
	}
</style>
