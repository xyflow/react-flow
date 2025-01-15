<script lang="ts">
	import {
		Handle,
		Position,
		type NodeProps,
		type Connection,
		useNodeConnections
	} from '@xyflow/svelte';

	let { id }: NodeProps = $props();

	function onConnectTarget(connection: Connection[]) {
		console.log('connect target', connection);
	}

	function onConnectSource(handleId: string, connection: Connection[]) {
		console.log('connect source', handleId, connection);
	}

	function onDisconnectTarget(connection: Connection[]) {
		console.log('disconnect target', connection);
	}

	function onDisconnectSource(handleId: string, connection: Connection[]) {
		console.log('disconnect source', handleId, connection);
	}

	const connections = useNodeConnections({ id: id, handleType: 'target' });

	$inspect(connections.current);
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
		id="a"
		type="source"
		position={Position.Right}
		onconnect={(connections) => onConnectSource('a', connections)}
		ondisconnect={(connections) => onDisconnectSource('a', connections)}
		class="source-a"
	/>
	<Handle
		id="b"
		type="source"
		position={Position.Right}
		onconnect={(connections) => onConnectSource('b', connections)}
		ondisconnect={(connections) => onDisconnectSource('b', connections)}
		class="source-b"
	/>
</div>

<style>
	.custom {
		background-color: #333;
		padding: 10px;
		border-radius: 10px;
		color: #fff;
	}

	.custom :global(.source-a) {
		top: 5px;
		transform: translate(50%, 0);
	}

	.custom :global(.source-b) {
		bottom: 5px;
		top: auto;
		transform: translate(50%, 0);
	}
</style>
