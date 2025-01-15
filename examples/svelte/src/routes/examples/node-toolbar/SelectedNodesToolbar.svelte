<script lang="ts">
	import { NodeToolbar, useNodes } from '@xyflow/svelte';

	let nodes = useNodes();

	let selectedNodeIds = $derived(
		nodes.current.filter((node) => node.selected).map((node) => node.id)
	);
	let isVisible = $derived(selectedNodeIds.length > 1);
</script>

<NodeToolbar nodeId={selectedNodeIds} {isVisible}>
	<button>Selection action</button>
</NodeToolbar>
