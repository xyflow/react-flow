<script lang="ts">
  import ResizeControl from './ResizeControl.svelte';
  import type { NodeResizerProps } from './types';
  import {
    ResizeControlVariant,
    XY_RESIZER_HANDLE_POSITIONS,
    XY_RESIZER_LINE_POSITIONS
  } from '@xyflow/system';

  let {
    isVisible = true,
    nodeId,
    handleClass,
    handleStyle,
    lineClass,
    lineStyle,
    ...rest
  }: NodeResizerProps = $props();
</script>

{#if isVisible}
  {#each XY_RESIZER_LINE_POSITIONS as position (position)}
    <ResizeControl
      class={lineClass}
      style={lineStyle}
      {nodeId}
      {position}
      variant={ResizeControlVariant.Line}
      {...rest}
    />
  {/each}
  {#each XY_RESIZER_HANDLE_POSITIONS as position (position)}
    <ResizeControl class={handleClass} style={handleStyle} {nodeId} {position} {...rest} />
  {/each}
{/if}
