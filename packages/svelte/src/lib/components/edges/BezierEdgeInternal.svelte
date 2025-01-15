<script lang="ts">
  import { getBezierPath } from '@xyflow/system';

  import BaseEdge from './BaseEdge.svelte';
  import type { EdgeProps } from '$lib/types';

  let {
    interactionWidth,
    label,
    labelStyle,
    markerEnd,
    markerStart,
    sourcePosition,
    sourceX,
    sourceY,
    style,
    targetPosition,
    targetX,
    targetY
  }: EdgeProps = $props();

  let [path, labelX, labelY] = $derived(
    getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition
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
