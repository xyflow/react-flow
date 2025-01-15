<script lang="ts">
  import { setContext, onDestroy } from 'svelte';
  import cc from 'classcat';
  import { errorMessages, nodeHasDimensions, Position } from '@xyflow/system';

  import drag from '$lib/actions/drag';
  import { getNodeInlineStyleDimensions } from './utils';
  import DefaultNode from '$lib/components/nodes/DefaultNode.svelte';

  import type { ConnectableContext, NodeWrapperProps } from './types';
  import type { NodeEvents } from '$lib/types';

  let {
    store,
    node,
    resizeObserver,
    nodeClickDistance,
    onnodeclick,
    onnodedrag,
    onnodedragstart,
    onnodedragstop,
    onnodemouseenter,
    onnodemouseleave,
    onnodemousemove,
    onnodecontextmenu
  }: NodeWrapperProps & NodeEvents = $props();

  let {
    data = {},
    selected = false,
    draggable: _draggable,
    selectable: _selectable,
    deletable = true,
    connectable: _connectable,
    hidden = false,
    dragging = false,
    style,
    class: className,
    type = 'default',
    parentId,
    sourcePosition,
    targetPosition,
    measured: { width: measuredWidth, height: measuredHeight } = { width: 0, height: 0 },
    initialWidth,
    initialHeight,
    width,
    height,
    dragHandle,
    internals: {
      z: zIndex = 0,
      positionAbsolute: { x: positionX, y: positionY }
    }
  } = $derived(node);

  let { id } = node;

  let draggable = $derived(_draggable ?? store.nodesDraggable);
  let selectable = $derived(_selectable ?? store.elementsSelectable);
  let connectable = $derived(_connectable ?? store.nodesConnectable);
  let initialized = $derived(nodeHasDimensions(node));

  function isInParentLookup(id: string) {
    return store.parentLookup.has(id);
  }

  let isParent = $derived(isInParentLookup(id));

  let nodeRef: HTMLDivElement | null = $state(null);
  let prevNodeRef: HTMLDivElement | null = null;

  let prevType: string | undefined;
  let prevSourcePosition: Position | undefined;
  let prevTargetPosition: Position | undefined;

  let NodeComponent = $derived(store.nodeTypes[type] ?? DefaultNode);

  let connectableContext: ConnectableContext = {
    get value() {
      return connectable;
    }
  };
  setContext('svelteflow__node_connectable', connectableContext);
  setContext('svelteflow__node_id', id);

  if (process.env.NODE_ENV === 'development') {
    $effect(() => {
      const valid = !!store.nodeTypes[type];
      if (!valid) {
        console.warn('003', errorMessages['error003'](type!));
      }
    });
  }

  let inlineStyleDimensions = $derived(
    getNodeInlineStyleDimensions({
      width,
      height,
      initialWidth,
      initialHeight,
      measuredWidth,
      measuredHeight
    })
  );

  $effect(() => {
    // if type, sourcePosition or targetPosition changes,
    // we need to re-calculate the handle positions
    const doUpdate =
      (prevType && type !== prevType) ||
      (prevSourcePosition && sourcePosition !== prevSourcePosition) ||
      (prevTargetPosition && targetPosition !== prevTargetPosition);

    if (doUpdate && nodeRef !== null) {
      requestAnimationFrame(() => {
        if (nodeRef !== null) {
          store.updateNodeInternals(
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
          );
        }
      });
    }

    prevType = type;
    prevSourcePosition = sourcePosition;
    prevTargetPosition = targetPosition;
  });

  // TODO: extract this part!
  $effect(() => {
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    if (resizeObserver && (!initialized || nodeRef !== prevNodeRef)) {
      prevNodeRef && resizeObserver.unobserve(prevNodeRef);
      nodeRef && resizeObserver.observe(nodeRef);
      prevNodeRef = nodeRef;
    }
    /* eslint-enable @typescript-eslint/no-unused-expressions */
  });

  onDestroy(() => {
    if (prevNodeRef) {
      resizeObserver?.unobserve(prevNodeRef);
    }
  });

  function onSelectNodeHandler(event: MouseEvent | TouchEvent) {
    if (selectable && (!store.selectNodesOnDrag || !draggable || store.nodeDragThreshold > 0)) {
      // this handler gets called by XYDrag on drag start when selectNodesOnDrag=true
      // here we only need to call it when selectNodesOnDrag=false
      store.handleNodeSelection(id);
    }

    onnodeclick?.({ node, event });
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if !hidden}
  <div
    use:drag={{
      nodeId: id,
      isSelectable: selectable,
      disabled: !draggable,
      handleSelector: dragHandle,
      noDragClass: 'nodrag',
      nodeClickDistance,
      onNodeMouseDown: store.handleNodeSelection,
      onDrag: (event, _, targetNode, nodes) => {
        onnodedrag?.({ event, targetNode, nodes });
      },
      onDragStart: (event, _, targetNode, nodes) => {
        onnodedragstart?.({ event, targetNode, nodes });
      },
      onDragStop: (event, _, targetNode, nodes) => {
        onnodedragstop?.({ event, targetNode, nodes });
      },
      store
    }}
    bind:this={nodeRef}
    data-id={id}
    class={cc(['svelte-flow__node', `svelte-flow__node-${type}`, className])}
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
    onclick={onSelectNodeHandler}
    onpointerenter={onnodemouseenter ? (event) => onnodemouseenter({ node, event }) : undefined}
    onpointerleave={onnodemouseleave ? (event) => onnodemouseleave({ node, event }) : undefined}
    onpointermove={onnodemousemove ? (event) => onnodemousemove({ node, event }) : undefined}
    oncontextmenu={onnodecontextmenu ? (event) => onnodecontextmenu({ node, event }) : undefined}
  >
    <NodeComponent
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
      {type}
      isConnectable={connectable}
      positionAbsoluteX={positionX}
      positionAbsoluteY={positionY}
      {width}
      {height}
    />
  </div>
{/if}
