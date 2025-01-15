<script lang="ts">
  import { getBezierPath } from '@xyflow/system';

  import BaseEdge from './BaseEdge.svelte';
  import type { BezierEdgeProps } from '$lib/types';

  let {
    id,
    interactionWidth,
    label,
    labelStyle,
    markerEnd,
    markerStart,
    pathOptions,
    sourcePosition,
    sourceX,
    sourceY,
    style,
    targetPosition,
    targetX,
    targetY
  }: BezierEdgeProps = $props();

  let [path, labelX, labelY] = $derived(
    getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      curvature: pathOptions?.curvature
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
