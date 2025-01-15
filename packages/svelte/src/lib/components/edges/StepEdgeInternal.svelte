<script lang="ts">
  import { getSmoothStepPath } from '@xyflow/system';

  import BaseEdge from './BaseEdge.svelte';
  import type { EdgeProps } from '$lib/types';

  let {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    label,
    labelStyle,
    markerStart,
    markerEnd,
    interactionWidth,
    style
  }: EdgeProps = $props();

  let [path, labelX, labelY] = $derived(
    getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 0
    })
  );
</script>

<BaseEdge
  {path}
  {labelX}
  {labelY}
  {label}
  {labelStyle}
  {markerStart}
  {markerEnd}
  {interactionWidth}
  {style}
/>
