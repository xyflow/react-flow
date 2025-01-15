<script lang="ts">
	import { Handle, Position, type NodeProps, useUpdateNodeInternals } from '@xyflow/svelte';

	let { id }: NodeProps = $props();

	const updateNodeInternals = useUpdateNodeInternals();

	let handleCount = $state(1);

	const onClick = () => {
		handleCount += 1;
		updateNodeInternals(id);
	};
</script>

<Handle type="target" position={Position.Top} />
<button onclick={onClick}>add handle</button>

{#each Array.from({ length: handleCount }) as handle, i}
	<Handle type="source" position={Position.Bottom} id={`${i}`} style={`left: ${i * 10}px;`} />
{/each}
