<script lang="ts">
	import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/svelte';
	import type { ResizeNode } from './types';

	let { data, selected = undefined }: NodeProps<ResizeNode> = $props();
</script>

<NodeResizer
	minWidth={data.minWidth ?? undefined}
	maxWidth={data.maxWidth ?? undefined}
	minHeight={data.minHeight ?? undefined}
	maxHeight={data.maxHeight ?? undefined}
	isVisible={data.isVisible ?? !!selected}
	shouldResize={data.shouldResize ?? undefined}
	onResizeStart={data.onResizeStart ?? undefined}
	onResize={data.onResize ?? undefined}
	onResizeEnd={data.onResizeEnd ?? undefined}
	keepAspectRatio={data.keepAspectRatio ?? undefined}
/>
<Handle type="target" position={Position.Left} />
<div>{data.label}</div>
<Handle type="source" position={Position.Right} />
