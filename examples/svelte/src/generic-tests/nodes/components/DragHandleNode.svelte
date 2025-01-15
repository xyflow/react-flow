<script lang="ts">
	import type { NodeProps } from '@xyflow/svelte';

	type $$Props = NodeProps;
</script>

<div class="container">
	<div class="drag-handle custom-drag-handle"></div>
</div>

<style>
	.container {
		width: 100px;
		height: 50px;
		background: red;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.drag-handle {
		display: inline-block;
		width: 25px;
		height: 25px;
		background-color: green;
	}
</style>
