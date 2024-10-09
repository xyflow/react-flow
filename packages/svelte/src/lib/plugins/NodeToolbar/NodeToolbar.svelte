<script lang="ts">
  import { getContext } from 'svelte';
  import { Position, getNodeToolbarTransform } from '@xyflow/system';
  import portal from '$lib/actions/portal';
  import type { InternalNode } from '$lib/types';
  import { useStore } from '$lib/store';

  import type { NodeToolbarProps } from './types';
  import { useSvelteFlow } from '$lib/hooks/useSvelteFlow';

  type $$Props = NodeToolbarProps;

  export let nodeId: $$Props['nodeId'] = undefined;
  export let position: $$Props['position'] = undefined;
  export let align: $$Props['align'] = undefined;
  export let offset: $$Props['offset'] = undefined;
  export let isVisible: $$Props['isVisible'] = undefined;

  const { domNode, viewport, nodeLookup, nodes } = useStore();
  const { getNodesBounds } = useSvelteFlow();
  const contextNodeId = getContext<string>('svelteflow__node_id');

  let transform: string;
  let toolbarNodes: InternalNode[] = [];
  let _offset = offset !== undefined ? offset : 10;
  let _position = position !== undefined ? position : Position.Top;
  let _align = align !== undefined ? align : 'center';

  $: {
    // only needed to trigger updates, $nodeLookup is just a helper that does not trigger any updates
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $nodes;

    const nodeIds = Array.isArray(nodeId) ? nodeId : [nodeId || contextNodeId];

    toolbarNodes = nodeIds.reduce<InternalNode[]>((res, nodeId) => {
      const node = $nodeLookup.get(nodeId);

      if (node) {
        res.push(node);
      }

      return res;
    }, []);
  }

  $: {
    const nodeRect = getNodesBounds(toolbarNodes);

    if (nodeRect) {
      transform = getNodeToolbarTransform(nodeRect, $viewport, _position, _offset, _align);
    }
  }

  $: zIndex =
    toolbarNodes.length === 0
      ? 1
      : Math.max(...toolbarNodes.map((node) => (node.internals.z || 5) + 1));

  //FIXME: Possible performance bottleneck
  $: selectedNodesCount = $nodes.filter((node) => node.selected).length;

  // if isVisible is not set, we show the toolbar only if its node is selected and no other node is selected
  $: isActive =
    typeof isVisible === 'boolean'
      ? isVisible
      : toolbarNodes.length === 1 && toolbarNodes[0].selected && selectedNodesCount === 1;
</script>

{#if $domNode && isActive && toolbarNodes}
  <div
    data-id={toolbarNodes.reduce((acc, node) => `${acc}${node.id} `, '').trim()}
    class="svelte-flow__node-toolbar"
    use:portal={{ domNode: $domNode }}
    style:position="absolute"
    style:transform
    style:z-index={zIndex}
  >
    <slot />
  </div>
{/if}
