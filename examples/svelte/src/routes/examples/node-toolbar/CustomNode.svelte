<script lang="ts" module>
	import { type Node } from '@xyflow/svelte';

	export type CustomNodeType = Node<{
		toolbarVisible?: boolean;
		toolbarPosition: Position;
		toolbarAlign?: 'start' | 'center' | 'end';
		label: string;
	}>;
</script>

<script lang="ts">
	import { NodeToolbar, type NodeProps, Handle, Position } from '@xyflow/svelte';

	let { data }: NodeProps<CustomNodeType> = $props();
</script>

<NodeToolbar
	isVisible={data.toolbarVisible}
	position={data.toolbarPosition}
	align={data.toolbarAlign}
>
	<button>delete</button>
	<button>copy</button>
	<button>expand</button>
</NodeToolbar>
<div class="node">
	<div>{data.label}</div>
	<Handle type="target" position={Position.Left} />
	<Handle type="source" position={Position.Right} />
</div>

<style>
	.node {
		width: 180px;
		height: 50px;
		border: solid 1px black;
		background: white;
	}
</style>
