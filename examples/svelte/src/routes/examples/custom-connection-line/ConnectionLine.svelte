<script lang="ts">
	import { getBezierPath, useConnection } from '@xyflow/svelte';

	const connection = useConnection();

	let path: string | null = $derived.by(() => {
		if (connection.current.inProgress) {
			const { from, to, fromPosition, toPosition } = connection.current;
			const pathParams = {
				sourceX: from.x,
				sourceY: from.y,
				sourcePosition: fromPosition,
				targetX: to.x,
				targetY: to.y,
				targetPosition: toPosition
			};
			const [path] = getBezierPath(pathParams);
			return path;
		}
		return null;
	});
</script>

{#if connection.current.inProgress}
	<path d={path} fill="none" stroke={connection.current.fromHandle.id} />
{/if}
