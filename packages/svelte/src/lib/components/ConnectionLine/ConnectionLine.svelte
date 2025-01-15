<script lang="ts">
  import cc from 'classcat';
  import type { Snippet } from 'svelte';
  import {
    ConnectionLineType,
    getBezierPath,
    getConnectionStatus,
    getSmoothStepPath,
    getStraightPath
  } from '@xyflow/system';

  import type { SvelteFlowStore } from '$lib/store/types';

  let {
    store,
    containerStyle = '',
    style = '',
    connectionLine
  }: {
    store: SvelteFlowStore;
    containerStyle: string;
    style: string;
    connectionLine?: Snippet;
  } = $props();

  let path = $derived.by(() => {
    if (!store.connection.inProgress) {
      return '';
    }

    const pathParams = {
      sourceX: store.connection.from.x,
      sourceY: store.connection.from.y,
      sourcePosition: store.connection.fromPosition,
      targetX: store.connection.to.x,
      targetY: store.connection.to.y,
      targetPosition: store.connection.toPosition
    };

    switch (store.connectionLineType) {
      case ConnectionLineType.Bezier: {
        const [path] = getBezierPath(pathParams);
        return path;
      }
      case ConnectionLineType.Straight: {
        const [path] = getStraightPath(pathParams);
        return path;
      }
      case ConnectionLineType.Step:
      case ConnectionLineType.SmoothStep: {
        const [path] = getSmoothStepPath({
          ...pathParams,
          borderRadius: store.connectionLineType === ConnectionLineType.Step ? 0 : undefined
        });
        return path;
      }
    }
  });
</script>

{#if store.connection.inProgress}
  <svg
    width={store.width}
    height={store.height}
    class="svelte-flow__connectionline"
    style={containerStyle}
  >
    <g class={cc(['svelte-flow__connection', getConnectionStatus(store.connection.isValid)])}>
      {#if connectionLine}
        {@render connectionLine()}
      {:else}
        <path d={path} {style} fill="none" class="svelte-flow__connection-path" />
      {/if}
    </g>
  </svg>
{/if}
