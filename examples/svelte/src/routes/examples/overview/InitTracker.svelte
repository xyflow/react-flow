<script lang="ts">
	import { useNodesInitialized, useInitialized } from '@xyflow/svelte';

	const nodesInitialized = useNodesInitialized();
	const initialized = useInitialized();

	$effect(() => {
		if (nodesInitialized) {
			console.log('nodes initialized');
		}
	});

	$effect(() => {
		if (initialized) {
			console.log('initialized');
		}
	});
</script>
