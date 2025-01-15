<script lang="ts">
  import cc from 'classcat';
  import type { BaseEdgeProps } from '../../types';
  import EdgeLabel from '../EdgeLabel/EdgeLabel.svelte';

  let {
    id,
    path,
    label,
    labelX,
    labelY,
    labelStyle,
    markerStart,
    markerEnd,
    style,
    interactionWidth = 20,
    class: className
  }: BaseEdgeProps = $props();
</script>

<path
  {id}
  d={path}
  class={cc(['svelte-flow__edge-path', className])}
  marker-start={markerStart}
  marker-end={markerEnd}
  fill="none"
  {style}
/>

{#if interactionWidth > 0}
  <path
    d={path}
    stroke-opacity={0}
    stroke-width={interactionWidth}
    fill="none"
    class="svelte-flow__edge-interaction"
  />
{/if}

{#if label}
  <EdgeLabel x={labelX} y={labelY} style={labelStyle}>
    {label}
  </EdgeLabel>
{/if}
