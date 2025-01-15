<script lang="ts">
  import { getContext } from 'svelte';
  import { Position, getNodeToolbarTransform } from '@xyflow/system';

  import portal from '$lib/actions/portal';
  import { useStore } from '$lib/store';
  import { useSvelteFlow } from '$lib/hooks/useSvelteFlow.svelte';

  import type { InternalNode } from '$lib/types';
  import type { NodeToolbarProps } from './types';

  let {
    nodeId,
    position = Position.Top,
    align = 'center',
    offset = 10,
    isVisible,
    children
  }: NodeToolbarProps = $props();

  const store = useStore();

  const { getNodesBounds } = useSvelteFlow();
  const contextNodeId = getContext<string>('svelteflow__node_id');

  let toolbarNodes: InternalNode[] = $derived.by(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    store.nodes;
    const nodeIds = Array.isArray(nodeId) ? nodeId : [nodeId ?? contextNodeId];

    return nodeIds.reduce<InternalNode[]>((res, nodeId) => {
      const node = store.nodeLookup.get(nodeId);

      if (node) {
        res.push(node);
      }

      return res;
    }, []);
  });

  let transform: string = $derived.by(() => {
    const nodeRect = getNodesBounds(toolbarNodes);
    if (nodeRect) {
      return getNodeToolbarTransform(nodeRect, store.viewport, position, offset, align);
    }
    return '';
  });

  let zIndex = $derived(
    toolbarNodes.length === 0
      ? 1
      : Math.max(...toolbarNodes.map((node) => (node.internals.z || 5) + 1))
  );

  //FIXME: Possible performance bottleneck
  let selectedNodesCount = $derived(store.nodes.filter((node) => node.selected).length);

  // if isVisible is not set, we show the toolbar only if its node is selected and no other node is selected
  let isActive = $derived(
    typeof isVisible === 'boolean'
      ? isVisible
      : toolbarNodes.length === 1 && toolbarNodes[0].selected && selectedNodesCount === 1
  );
</script>

{#if store.domNode && isActive && toolbarNodes}
  <div
    data-id={toolbarNodes.reduce((acc, node) => `${acc}${node.id} `, '').trim()}
    class="svelte-flow__node-toolbar"
    use:portal={{ domNode: store.domNode }}
    style:position="absolute"
    style:transform
    style:z-index={zIndex}
  >
    {@render children?.()}
  </div>
{/if}
