<script lang="ts">
  import { getContext } from 'svelte';
  import cc from 'classcat';
  import {
    Position,
    XYHandle,
    isMouseEvent,
    type HandleConnection,
    areConnectionMapsEqual,
    handleConnectionChange,
    ConnectionMode
  } from '@xyflow/system';

  import { useStore } from '$lib/store';
  import type { HandleProps } from '$lib/types';
  import type { ConnectableContext } from '../NodeWrapper/types';

  let {
    id: handleId = null,
    type = 'source',
    position = Position.Top,
    style,
    class: className,
    isConnectable: isConnectableProp,
    isValidConnection: isValidConnectionProp,
    onconnect,
    ondisconnect,
    children
  }: HandleProps = $props();
  // @todo implement connectablestart, connectableend
  // export let isConnectableStart: $$Props['isConnectableStart'] = undefined;
  // export let isConnectableEnd: $$Props['isConnectableEnd'] = undefined;

  const nodeId = getContext<string>('svelteflow__node_id');
  const isConnectableContext = getContext<ConnectableContext>('svelteflow__node_connectable');

  let isTarget = $derived(type === 'target');
  let isConnectable = $derived(
    isConnectableProp !== undefined ? isConnectableProp : isConnectableContext.value
  );

  let store = useStore();

  function onPointerDown(event: MouseEvent | TouchEvent) {
    const isMouseTriggered = isMouseEvent(event);

    if ((isMouseTriggered && event.button === 0) || !isMouseTriggered) {
      XYHandle.onPointerDown(event, {
        handleId,
        nodeId,
        isTarget,
        connectionRadius: store.connectionRadius,
        domNode: store.domNode,
        nodeLookup: store.nodeLookup,
        connectionMode: store.connectionMode,
        lib: 'svelte',
        autoPanOnConnect: store.autoPanOnConnect,
        flowId: store.flowId,
        isValidConnection: isValidConnectionProp ?? store.isValidConnection,
        updateConnection: store.updateConnection,
        cancelConnection: store.cancelConnection,
        panBy: store.panBy,
        onConnect: (connection) => {
          const edge = store.onedgecreate ? store.onedgecreate(connection) : connection;

          if (!edge) {
            return;
          }

          store.addEdge(edge);
          store.onconnect?.(connection);
        },
        onConnectStart: (event, startParams) => {
          store.onconnectstart?.(event, {
            nodeId: startParams.nodeId,
            handleId: startParams.handleId,
            handleType: startParams.handleType
          });
        },
        onConnectEnd: (event, connectionState) => {
          store.onconnectend?.(event, connectionState);
        },
        getTransform: () => [store.viewport.x, store.viewport.y, store.viewport.zoom],
        getFromHandle: () => store.connection.fromHandle
      });
    }
  }

  let prevConnections: Map<string, HandleConnection> | null = null;
  $effect.pre(() => {
    // connectionLookup is not reactive, so we use edges to get notified about updates
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    store.edges;
    if (onconnect || ondisconnect) {
      let connections = store.connectionLookup.get(
        `${nodeId}-${type}${handleId ? `-${handleId}` : ''}`
      );

      if (prevConnections && !areConnectionMapsEqual(connections, prevConnections)) {
        const _connections = connections ?? new Map();

        handleConnectionChange(prevConnections, _connections, ondisconnect);
        handleConnectionChange(_connections, prevConnections, onconnect);
      }

      prevConnections = new Map(connections);
    }
  });

  let [connectionInProcess, connectingFrom, connectingTo, isPossibleEndHandle, valid] = $derived.by(
    () => {
      const { fromHandle, toHandle, isValid } = store.connection;

      const connectionInProcess = !!fromHandle;

      const connectingFrom =
        fromHandle?.nodeId === nodeId && fromHandle?.type === type && fromHandle?.id === handleId;

      const connectingTo =
        toHandle?.nodeId === nodeId && toHandle?.type === type && toHandle?.id === handleId;

      const isPossibleEndHandle =
        store.connectionMode === ConnectionMode.Strict
          ? fromHandle?.type !== type
          : nodeId !== fromHandle?.nodeId || handleId !== fromHandle?.id;

      const valid = connectingTo && isValid;

      return [connectionInProcess, connectingFrom, connectingTo, isPossibleEndHandle, valid];
    }
  );
</script>

<!--
@component
The Handle component is the part of a node that can be used to connect nodes.
-->
<div
  data-handleid={handleId}
  data-nodeid={nodeId}
  data-handlepos={position}
  data-id="{store.flowId}-{nodeId}-{handleId}-{type}"
  class={cc([
    'svelte-flow__handle',
    `svelte-flow__handle-${position}`,
    'nodrag',
    'nopan',
    position,
    className
  ])}
  class:valid
  class:connectingto={connectingTo}
  class:connectingfrom={connectingFrom}
  class:source={!isTarget}
  class:target={isTarget}
  class:connectablestart={isConnectable}
  class:connectableend={isConnectable}
  class:connectable={isConnectable}
  class:connectionindicator={isConnectable && (!connectionInProcess || isPossibleEndHandle)}
  onmousedown={onPointerDown}
  ontouchstart={onPointerDown}
  {style}
  role="button"
  tabindex="-1"
>
  {@render children?.()}
</div>
