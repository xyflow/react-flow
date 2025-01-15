<script lang="ts">
	import { Handle, NodeResizeControl, Position, type NodeProps } from '@xyflow/svelte';
	import type { ResizeNode } from './types';

	let { data }: NodeProps<ResizeNode> = $props();
</script>

<NodeResizeControl
	minWidth={data.minWidth ?? undefined}
	maxWidth={data.maxWidth ?? undefined}
	minHeight={data.minHeight ?? undefined}
	maxHeight={data.maxHeight ?? undefined}
	shouldResize={data.shouldResize ?? undefined}
	onResizeStart={data.onResizeStart ?? undefined}
	onResize={data.onResize ?? undefined}
	onResizeEnd={data.onResizeEnd ?? undefined}
	keepAspectRatio={data.keepAspectRatio ?? undefined}
	color="red"
	position={Position.Top}
/>
<NodeResizeControl
	minWidth={data.minWidth ?? undefined}
	maxWidth={data.maxWidth ?? undefined}
	minHeight={data.minHeight ?? undefined}
	maxHeight={data.maxHeight ?? undefined}
	shouldResize={data.shouldResize ?? undefined}
	onResizeStart={data.onResizeStart ?? undefined}
	onResize={data.onResize ?? undefined}
	onResizeEnd={data.onResizeEnd ?? undefined}
	keepAspectRatio={data.keepAspectRatio ?? undefined}
	color="red"
	position={Position.Bottom}
/>
<Handle type="target" position={Position.Left} />
<div style="padding: 10px;">{data.label}</div>
<Handle type="source" position={Position.Right} />
