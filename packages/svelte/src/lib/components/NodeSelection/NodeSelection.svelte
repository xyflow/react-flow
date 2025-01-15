<script lang="ts">
  import { getInternalNodesBounds, isNumeric, type Rect } from '@xyflow/system';

  import { Selection } from '$lib/components/Selection';
  import drag from '$lib/actions/drag';

  import type { NodeSelectionProps } from './types';

  let {
    store,
    onnodedrag,
    onnodedragstart,
    onnodedragstop,
    onselectionclick,
    onselectioncontextmenu
  }: NodeSelectionProps = $props();

  let bounds: Rect | null = $derived.by(() => {
    if (store.selectionRectMode === 'nodes') {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      store.nodes;
      return getInternalNodesBounds(store.nodeLookup, { filter: (node) => !!node.selected });
    }
    return null;
  });

  function oncontextmenu(event: MouseEvent | TouchEvent) {
    const selectedNodes = store.nodes.filter((n) => n.selected);
    onselectioncontextmenu?.({ nodes: selectedNodes, event });
  }

  function onclick(event: MouseEvent | TouchEvent) {
    const selectedNodes = store.nodes.filter((n) => n.selected);
    onselectionclick?.({ nodes: selectedNodes, event });
  }
</script>

{#if store.selectionRectMode === 'nodes' && bounds && isNumeric(bounds.x) && isNumeric(bounds.y)}
  <div
    class="selection-wrapper nopan"
    style="width: {bounds.width}px; height: {bounds.height}px; transform: translate({bounds.x}px, {bounds.y}px)"
    use:drag={{
      disabled: false,
      store,
      onDrag: (event, _, __, nodes) => {
        onnodedrag?.({ event, targetNode: null, nodes });
      },
      onDragStart: (event, _, __, nodes) => {
        onnodedragstart?.({ event, targetNode: null, nodes });
      },
      onDragStop: (event, _, __, nodes) => {
        onnodedragstop?.({ event, targetNode: null, nodes });
      }
    }}
    {oncontextmenu}
    {onclick}
    role="button"
    tabindex="-1"
    onkeyup={() => {}}
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
