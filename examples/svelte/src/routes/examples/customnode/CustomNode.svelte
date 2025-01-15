<script lang="ts">
	import { Handle, Position, type NodeProps, type Node } from '@xyflow/svelte';
	import { bg } from './+page.svelte';

	let { data }: NodeProps<Node> = $props();

	const { colorStore } = data;
</script>

<div class="custom">
	<Handle type="target" position={Position.Left} />
	<div>
		Custom Color Picker Node: <strong>{bg.color}</strong>
	</div>
	<input
		class="nodrag"
		type="color"
		oninput={(evt) => (bg.color = evt.currentTarget.value)}
		value={bg.color}
	/>
	<Handle type="source" position={Position.Right} id="a" style="top: 20px;" />
	<Handle type="source" position={Position.Right} id="b" style="top: auto; bottom: 10px;" />
</div>

<style>
	.custom {
		background-color: white;
		padding: 10px;
		border: 1px solid #777;
		border-radius: 20px;
	}
</style>
