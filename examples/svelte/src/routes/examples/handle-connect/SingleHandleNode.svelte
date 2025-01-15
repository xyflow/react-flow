<script lang="ts">
	import { Handle, Position, type NodeProps, type Connection } from '@xyflow/svelte';

	let { id }: NodeProps = $props();

	function onConnectTarget(connection: Connection[]) {
		console.log('connect target', connection);
	}

	function onConnectSource(connection: Connection[]) {
		console.log('connect source', connection);
	}

	function onDisconnectTarget(connection: Connection[]) {
		console.log('disconnect target', connection);
	}

	function onDisconnectSource(connection: Connection[]) {
		console.log('disconnect source', connection);
	}
</script>

<div class="custom">
	<Handle
		type="target"
		position={Position.Left}
		onconnect={onConnectTarget}
		ondisconnect={onDisconnectTarget}
	/>
	<div>node {id}</div>
	<Handle
		type="source"
		position={Position.Right}
		onconnect={onConnectSource}
		ondisconnect={onDisconnectSource}
	/>
</div>

<style>
	.custom {
		background-color: #333;
		padding: 10px;
		border-radius: 10px;
		color: #fff;
	}
</style>
