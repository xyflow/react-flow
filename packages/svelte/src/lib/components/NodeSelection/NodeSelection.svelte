<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getInternalNodesBounds, isNumeric, type Rect } from '@xyflow/system';

  import { useStore } from '$lib/store';
  import { Selection } from '$lib/components/Selection';
  import drag from '$lib/actions/drag';
  import type { Node, NodeEventMap } from '$lib/types';

  const store = useStore();
  const { selectionRectMode, nodes, nodeLookup } = store;

  const dispatch = createEventDispatcher<
    NodeEventMap & {
      selectioncontextmenu: { nodes: Node[]; event: MouseEvent | TouchEvent };
      selectionclick: { nodes: Node[]; event: MouseEvent | TouchEvent };
    }
  >();

  let bounds: Rect | null = null;

  $: if ($selectionRectMode === 'nodes') {
    bounds = getInternalNodesBounds($nodeLookup, { filter: (node) => !!node.selected });
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $nodes;
  }

  function onContextMenu(event: MouseEvent | TouchEvent) {
    const selectedNodes = $nodes.filter((n) => n.selected);
    dispatch('selectioncontextmenu', { nodes: selectedNodes, event });
  }

  function onClick(event: MouseEvent | TouchEvent) {
    const selectedNodes = $nodes.filter((n) => n.selected);
    dispatch('selectionclick', { nodes: selectedNodes, event });
  }
</script>

{#if $selectionRectMode === 'nodes' && bounds && isNumeric(bounds.x) && isNumeric(bounds.y)}
  <div
    class="selection-wrapper nopan"
    style="width: {bounds.width}px; height: {bounds.height}px; transform: translate({bounds.x}px, {bounds.y}px)"
    use:drag={{
      disabled: false,
      store,
      onDrag: (event, _, __, nodes) => {
        dispatch('nodedrag', { event, targetNode: null, nodes });
      },
      onDragStart: (event, _, __, nodes) => {
        dispatch('nodedragstart', { event, targetNode: null, nodes });
      },
      onDragStop: (event, _, __, nodes) => {
        dispatch('nodedragstop', { event, targetNode: null, nodes });
      }
    }}
    on:contextmenu={onContextMenu}
    on:click={onClick}
    role="button"
    tabindex="-1"
    on:keyup={() => {}}
  >
    <Selection width="100%" height="100%" x={0} y={0} />
  </div>
{/if}

<style>
  .selection-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 7;
    pointer-events: all;
  }
</style>
