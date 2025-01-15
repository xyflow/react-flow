<script lang="ts">
	import type { BuiltInNode, NodeProps } from '@xyflow/svelte';

	let { data = { label: 'Node' } }: NodeProps<BuiltInNode> = $props();
</script>

<div class="custom">
	<div>{data.label}</div>
	<div class="custom-drag-handle" style="width:15px;height:15px;background:#222;"></div>
</div>

<style>
	.custom {
		background: white;
		padding: 10px;
	}
</style>
