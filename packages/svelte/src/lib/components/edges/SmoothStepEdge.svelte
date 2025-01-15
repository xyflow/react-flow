<script lang="ts">
  import { getSmoothStepPath } from '@xyflow/system';

  import BaseEdge from './BaseEdge.svelte';
  import type { SmoothStepEdgeProps } from '$lib/types';

  let {
    id,
    interactionWidth,
    label,
    labelStyle,
    style,
    markerEnd,
    markerStart,
    pathOptions,
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY
  }: SmoothStepEdgeProps = $props();

  let [path, labelX, labelY] = $derived(
    getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: pathOptions?.borderRadius,
      offset: pathOptions?.offset
    })
  );
</script>

<BaseEdge
  {id}
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
