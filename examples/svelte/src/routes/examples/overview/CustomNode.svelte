<script lang="ts">
	import { Handle, Position, type BuiltInNode, type NodeProps } from '@xyflow/svelte';

	let {
		data = { label: 'Node' },
		positionAbsoluteX = 0,
		positionAbsoluteY = 0
	}: NodeProps<BuiltInNode> = $props();
</script>

<div class="custom">
	<div>{data.label}</div>
	<div>{~~positionAbsoluteX}, {~~positionAbsoluteY}</div>

	<Handle type="target" position={Position.Top} />

	<Handle type="source" position={Position.Bottom} style="left: 10%;" id="a" />
	<Handle type="source" position={Position.Bottom} id="b" />
	<Handle type="source" position={Position.Bottom} style="left: 90%;" id="c" />
</div>

<style>
	.custom {
		background: #ffcc00;
		padding: 10px;
	}
</style>
