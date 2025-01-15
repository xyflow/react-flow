<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';

	type $$Props = NodeProps;

	interface Props {
		id: string;
		positionAbsoluteX?: number;
		positionAbsoluteY?: number;
		zIndex?: number;
		[key: string]: any
	}

	let {
		id,
		positionAbsoluteX = 0,
		positionAbsoluteY = 0,
		zIndex = 0,
		...rest
	}: Props = $props();

	rest;
</script>

<Handle type="target" position={Position.Top} />
<div>{id}</div>
<div>
	x:{Math.round(positionAbsoluteX)} y:{Math.round(positionAbsoluteY)} z:{zIndex}
</div>
<Handle type="source" position={Position.Bottom} />
