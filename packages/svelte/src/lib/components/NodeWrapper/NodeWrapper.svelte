<svelte:options immutable />

<script lang="ts">
  import { setContext, onDestroy, createEventDispatcher } from 'svelte';
  import { get, writable } from 'svelte/store';
  import cc from 'classcat';
  import { Position,  XYError, XYErrorCode } from '@xyflow/system';

  import drag from '$lib/actions/drag';
  import { useStore } from '$lib/store';
  import DefaultNode from '$lib/components/nodes/DefaultNode.svelte';
  import type { NodeWrapperProps } from './types';
  import { getNodeInlineStyleDimensions } from './utils';
  import type { NodeEventMap } from '$lib/types';

  interface $$Props extends NodeWrapperProps {}

  export let node: $$Props['node'];
  export let id: $$Props['id'];
  export let data: $$Props['data'] = {};
  export let selected: $$Props['selected'] = false;
  export let draggable: $$Props['draggable'] = undefined;
  export let selectable: $$Props['selectable'] = undefined;
  export let connectable: $$Props['connectable'] = true;
  export let deletable: $$Props['deletable'] = true;
  export let hidden: $$Props['hidden'] = false;
  export let dragging: boolean = false;
  export let resizeObserver: $$Props['resizeObserver'] = null;
  export let style: $$Props['style'] = undefined;
  export let type: $$Props['type'] = 'default';
  export let isParent: $$Props['isParent'] = false;
  export let positionX: $$Props['positionX'];
  export let positionY: $$Props['positionY'];
  export let sourcePosition: $$Props['sourcePosition'] = undefined;
  export let targetPosition: $$Props['targetPosition'] = undefined;
  export let zIndex: $$Props['zIndex'];
  export let measuredWidth: $$Props['measuredWidth'] = undefined;
  export let measuredHeight: $$Props['measuredHeight'] = undefined;
  export let initialWidth: $$Props['initialWidth'] = undefined;
  export let initialHeight: $$Props['initialHeight'] = undefined;
  export let width: $$Props['width'] = undefined;
  export let height: $$Props['height'] = undefined;
  export let dragHandle: $$Props['dragHandle'] = undefined;
  export let initialized: $$Props['initialized'] = false;
  export let parentId: $$Props['parentId'] = undefined;
  export let nodeClickDistance: $$Props['nodeClickDistance'] = undefined;

  let className: string = '';
  export { className as class };

  const store = useStore();
  const {
    nodeTypes,
    nodeDragThreshold,
    selectNodesOnDrag,
    handleNodeSelection,
    updateNodeInternals
  } = store;

  let nodeRef: HTMLDivElement;
  let prevNodeRef: HTMLDivElement | null = null;

  const dispatchNodeEvent = createEventDispatcher<NodeEventMap>();
  const connectableStore = writable(connectable);
  let prevType: string | undefined = undefined;
  let prevSourcePosition: Position | undefined = undefined;
  let prevTargetPosition: Position | undefined = undefined;

  $: nodeType = type || 'default';
  $: nodeTypeValid = !!$nodeTypes[nodeType];
  $: nodeComponent = $nodeTypes[nodeType] || DefaultNode;

  $: {
    if (!nodeTypeValid) {
      const error = new XYError(XYErrorCode.NODE_TYPE_NOT_FOUND, type)
      console.warn(error.code, error.message);
    }
  }

  $: inlineStyleDimensions = getNodeInlineStyleDimensions({
    width,
    height,
    initialWidth,
    initialHeight,
    measuredWidth,
    measuredHeight
  });

  $: {
    connectableStore.set(!!connectable);
  }

  $: {
    // if type, sourcePosition or targetPosition changes,
    // we need to re-calculate the handle positions
    const doUpdate =
      (prevType && nodeType !== prevType) ||
      (prevSourcePosition && sourcePosition !== prevSourcePosition) ||
      (prevTargetPosition && targetPosition !== prevTargetPosition);

    if (doUpdate) {
      requestAnimationFrame(() =>
        updateNodeInternals(
          new Map([
            [
              id,
              {
                id,
                nodeElement: nodeRef,
                force: true
              }
            ]
          ])
        )
      );
    }

    prevType = nodeType;
    prevSourcePosition = sourcePosition;
    prevTargetPosition = targetPosition;
  }

  setContext('svelteflow__node_id', id);
  setContext('svelteflow__node_connectable', connectableStore);

  $: {
    if (resizeObserver && (nodeRef !== prevNodeRef || !initialized)) {
      prevNodeRef && resizeObserver.unobserve(prevNodeRef);
      nodeRef && resizeObserver.observe(nodeRef);
      prevNodeRef = nodeRef;
    }
  }

  onDestroy(() => {
    if (prevNodeRef) {
      resizeObserver?.unobserve(prevNodeRef);
    }
  });

  function onSelectNodeHandler(event: MouseEvent | TouchEvent) {
    if (selectable && (!get(selectNodesOnDrag) || !draggable || get(nodeDragThreshold) > 0)) {
      // this handler gets called by XYDrag on drag start when selectNodesOnDrag=true
      // here we only need to call it when selectNodesOnDrag=false
      handleNodeSelection(id);
    }

    dispatchNodeEvent('nodeclick', { node: node.internals.userNode, event });
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if !hidden}
  <div
    use:drag={{
      nodeId: id,
      isSelectable: selectable,
      disabled: false,
      handleSelector: dragHandle,
      noDragClass: 'nodrag',
      nodeClickDistance,
      onNodeMouseDown: handleNodeSelection,
      onDrag: (event, _, targetNode, nodes) => {
        dispatchNodeEvent('nodedrag', { event, targetNode, nodes });
      },
      onDragStart: (event, _, targetNode, nodes) => {
        dispatchNodeEvent('nodedragstart', { event, targetNode, nodes });
      },
      onDragStop: (event, _, targetNode, nodes) => {
        dispatchNodeEvent('nodedragstop', { event, targetNode, nodes });
      },
      store
    }}
    bind:this={nodeRef}
    data-id={id}
    class={cc(['svelte-flow__node', `svelte-flow__node-${nodeType}`, className])}
    class:dragging
    class:selected
    class:draggable
    class:connectable
    class:selectable
    class:nopan={draggable}
    class:parent={isParent}
    style:z-index={zIndex}
    style:transform="translate({positionX}px, {positionY}px)"
    style:visibility={initialized ? 'visible' : 'hidden'}
    style="{style ?? ''};{inlineStyleDimensions.width}{inlineStyleDimensions.height}"
    on:click={onSelectNodeHandler}
    on:mouseenter={(event) => dispatchNodeEvent('nodemouseenter', { node, event })}
    on:mouseleave={(event) => dispatchNodeEvent('nodemouseleave', { node, event })}
    on:mousemove={(event) => dispatchNodeEvent('nodemousemove', { node, event })}
    on:contextmenu={(event) => dispatchNodeEvent('nodecontextmenu', { node, event })}
  >
    <svelte:component
      this={nodeComponent}
      {data}
      {id}
      {selected}
      {selectable}
      {deletable}
      {sourcePosition}
      {targetPosition}
      {zIndex}
      {dragging}
      {draggable}
      {dragHandle}
      {parentId}
      type={nodeType}
      isConnectable={$connectableStore}
      positionAbsoluteX={positionX}
      positionAbsoluteY={positionY}
      {width}
      {height}
    />
  </div>
{/if}
