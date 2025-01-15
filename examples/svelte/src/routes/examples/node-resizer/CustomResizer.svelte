<script lang="ts">
	import { Handle, Position, type NodeProps, NodeResizeControl, type Node } from '@xyflow/svelte';
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
	style="background: transparent; border: none;"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="8"
		height="8"
		viewBox="0 0 24 24"
		stroke-width="2"
		stroke="currentColor"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
		style="position: absolute; right: 2px; bottom: 2px;"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<polyline points="16 20 20 20 20 16" />
		<line x1="14" y1="14" x2="20" y2="20" />
		<polyline points="8 4 4 4 4 8" />
		<line x1="4" y1="4" x2="10" y2="10" />
	</svg>
</NodeResizeControl>
<Handle type="target" position={Position.Left} />
<div>{data.label}</div>
<Handle type="source" position={Position.Right} />
