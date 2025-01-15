<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';

	let { isConnectable }: NodeProps = $props();

	const handleStyle = 'width: 10px; height: 10px; bottom: -5px;';
</script>

<div style="background: #DDD; padding: 25px">
	<div>Node</div>
	<Handle
		type="source"
		id="red"
		position={Position.Bottom}
		style={handleStyle + 'left: 15%; background: red;'}
		{isConnectable}
	/>
	<Handle
		type="source"
		position={Position.Bottom}
		id="blue"
		style={handleStyle + 'left: 50%; background: blue;'}
		{isConnectable}
	/>
	<Handle
		type="source"
		position={Position.Bottom}
		id="orange"
		style={handleStyle + 'left: 85%; background: orange;'}
		{isConnectable}
	/>
</div>
