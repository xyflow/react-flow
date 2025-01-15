<script lang="ts">
  import { onDestroy } from 'svelte';

  import { NodeWrapper } from '$lib/components/NodeWrapper';

  import type { NodeEvents } from '$lib/types';
  import type { SvelteFlowStore } from '$lib/store/types';

  let {
    store,
    nodeClickDistance,
    onnodeclick,
    onnodecontextmenu,
    onnodemouseenter,
    onnodemousemove,
    onnodemouseleave,
    onnodedrag,
    onnodedragstart,
    onnodedragstop
  }: { store: SvelteFlowStore; nodeClickDistance?: number } & NodeEvents = $props();

  const resizeObserver: ResizeObserver | null =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver((entries: ResizeObserverEntry[]) => {
          const updates = new Map();

          entries.forEach((entry: ResizeObserverEntry) => {
            const id = entry.target.getAttribute('data-id') as string;

            updates.set(id, {
              id,
              nodeElement: entry.target as HTMLDivElement,
              force: true
            });
          });

          store.updateNodeInternals(updates);
        });

  onDestroy(() => {
    resizeObserver?.disconnect();
  });
</script>

<div class="svelte-flow__nodes">
  {#each store.visible.nodes.values() as node (node.id)}
    <NodeWrapper
      {store}
      {node}
      {resizeObserver}
      {nodeClickDistance}
      {onnodeclick}
      {onnodemouseenter}
      {onnodemousemove}
      {onnodemouseleave}
      {onnodedrag}
      {onnodedragstart}
      {onnodedragstop}
      {onnodecontextmenu}
    />
  {/each}
</div>

<style>
  .svelte-flow__nodes {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
</style>
