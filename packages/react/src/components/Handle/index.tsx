import {
  type ForwardedRef,
  type HTMLAttributes,
  memo,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';
import {
  addEdge,
  type Connection,
  ConnectionMode,
  getHostForElement,
  type HandleProps as HandlePropsSystem,
  type HandleType,
  isMouseEvent,
  OnConnect,
  Position,
  XYError,
  XYErrorCode,
  XYHandle,
  ConnectionState,
  Optional,
} from '@xyflow/system';

import { useStore, useStoreApi } from '../../hooks/useStore';
import { useNodeId } from '../../contexts/NodeIdContext';
import { type ReactFlowState } from '../../types';
import { fixedForwardRef } from '../../utils';

export interface HandleProps extends HandlePropsSystem, Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  /** Callback called when connection is made */
  onConnect?: OnConnect;
}

const selector = (s: ReactFlowState) => ({
  connectOnClick: s.connectOnClick,
  noPanClassName: s.noPanClassName,
  rfId: s.rfId,
});

const connectingSelector =
  (nodeId: string | null, handleId: string | null, type: HandleType) => (state: ReactFlowState) => {
    const { connectionClickStartHandle: clickHandle, connectionMode, connection } = state;

    const { fromHandle, toHandle, isValid } = connection;

    const connectingTo = toHandle?.nodeId === nodeId && toHandle?.id === handleId && toHandle?.type === type;

    return {
      connectingFrom: fromHandle?.nodeId === nodeId && fromHandle?.id === handleId && fromHandle?.type === type,
      connectingTo,
      clickConnecting: clickHandle?.nodeId === nodeId && clickHandle?.id === handleId && clickHandle?.type === type,
      isPossibleEndHandle:
        connectionMode === ConnectionMode.Strict
          ? fromHandle?.type !== type
          : nodeId !== fromHandle?.nodeId || handleId !== fromHandle?.id,
      connectionInProcess: !!fromHandle,
      valid: connectingTo && isValid,
    };
  };

function HandleComponent(
  {
    type = 'source',
    position = Position.Top,
    isValidConnection,
    isConnectable = true,
    isConnectableStart = true,
    isConnectableEnd = true,
    id,
    onConnect,
    children,
    className,
    onMouseDown,
    onTouchStart,
    ...rest
  }: HandleProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const handleId = id || null;
  const isTarget = type === 'target';
  const store = useStoreApi();
  const nodeId = useNodeId();
  const { connectOnClick, noPanClassName, rfId } = useStore(selector, shallow);
  const { connectingFrom, connectingTo, clickConnecting, isPossibleEndHandle, connectionInProcess, valid } = useStore(
    connectingSelector(nodeId, handleId, type),
    shallow
  );

  if (!nodeId) {
    const error = new XYError(XYErrorCode.HANDLE_NODE_ID_NOT_FOUND);
    store.getState().onError?.(error.code, error.message, error);
  }

  const onConnectExtended = (params: Connection) => {
    const { defaultEdgeOptions, onConnect: onConnectAction, hasDefaultEdges } = store.getState();

    const edgeParams = {
      ...defaultEdgeOptions,
      ...params,
    };
    if (hasDefaultEdges) {
      const { edges, setEdges } = store.getState();
      setEdges(addEdge(edgeParams, edges));
    }

    onConnectAction?.(edgeParams);
    onConnect?.(edgeParams);
  };

  const onPointerDown = (event: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
    if (!nodeId) {
      return;
    }

    const isMouseTriggered = isMouseEvent(event.nativeEvent);

    if (
      isConnectableStart &&
      ((isMouseTriggered && (event as ReactMouseEvent<HTMLDivElement>).button === 0) || !isMouseTriggered)
    ) {
      const currentStore = store.getState();

      XYHandle.onPointerDown(event.nativeEvent, {
        autoPanOnConnect: currentStore.autoPanOnConnect,
        connectionMode: currentStore.connectionMode,
        connectionRadius: currentStore.connectionRadius,
        domNode: currentStore.domNode,
        nodeLookup: currentStore.nodeLookup,
        lib: currentStore.lib,
        isTarget,
        handleId,
        nodeId,
        flowId: currentStore.rfId,
        panBy: currentStore.panBy,
        cancelConnection: currentStore.cancelConnection,
        onConnectStart: currentStore.onConnectStart,
        onConnectEnd: currentStore.onConnectEnd,
        updateConnection: currentStore.updateConnection,
        onConnect: onConnectExtended,
        isValidConnection: isValidConnection || currentStore.isValidConnection,
        getTransform: () => store.getState().transform,
        getFromHandle: () => store.getState().connection.fromHandle,
        autoPanSpeed: currentStore.autoPanSpeed,
      });
    }

    if (isMouseTriggered) {
      onMouseDown?.(event as ReactMouseEvent<HTMLDivElement>);
    } else {
      onTouchStart?.(event as ReactTouchEvent<HTMLDivElement>);
    }
  };

  const onClick = (event: ReactMouseEvent) => {
    const {
      onClickConnectStart,
      onClickConnectEnd,
      connectionClickStartHandle,
      connectionMode,
      isValidConnection: isValidConnectionStore,
      lib,
      rfId: flowId,
      nodeLookup,
      connection: connectionState,
    } = store.getState();

    if (!nodeId || (!connectionClickStartHandle && !isConnectableStart)) {
      return;
    }

    if (!connectionClickStartHandle) {
      onClickConnectStart?.(event.nativeEvent, { nodeId, handleId, handleType: type });
      store.setState({ connectionClickStartHandle: { nodeId, type, id: handleId } });
      return;
    }

    const doc = getHostForElement(event.target as HTMLElement);
    const isValidConnectionHandler = isValidConnection || isValidConnectionStore;
    const { connection, isValid } = XYHandle.isValid(event.nativeEvent, {
      handle: {
        nodeId,
        id: handleId,
        type,
      },
      connectionMode,
      fromNodeId: connectionClickStartHandle.nodeId,
      fromHandleId: connectionClickStartHandle.id || null,
      fromType: connectionClickStartHandle.type,
      isValidConnection: isValidConnectionHandler,
      flowId,
      doc,
      lib,
      nodeLookup,
    });

    if (isValid && connection) {
      onConnectExtended(connection);
    }

    const connectionClone = structuredClone(connectionState) as Optional<ConnectionState, 'inProgress'>;
    delete connectionClone.inProgress;
    connectionClone.toPosition = connectionClone.toHandle ? connectionClone.toHandle.position : null;
    onClickConnectEnd?.(event as unknown as MouseEvent, connectionClone);

    store.setState({ connectionClickStartHandle: null });
  };

  return (
    <div
      data-handleid={handleId}
      data-nodeid={nodeId}
      data-handlepos={position}
      data-id={`${rfId}-${nodeId}-${handleId}-${type}`}
      className={cc([
        'react-flow__handle',
        `react-flow__handle-${position}`,
        'nodrag',
        noPanClassName,
        className,
        {
          source: !isTarget,
          target: isTarget,
          connectable: isConnectable,
          connectablestart: isConnectableStart,
          connectableend: isConnectableEnd,
          clickconnecting: clickConnecting,
          connectingfrom: connectingFrom,
          connectingto: connectingTo,
          valid,
          // shows where you can start a connection from
          // and where you can end it while connecting
          connectionindicator:
            isConnectable &&
            (!connectionInProcess || isPossibleEndHandle) &&
            (connectionInProcess ? isConnectableEnd : isConnectableStart),
        },
      ])}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      onClick={connectOnClick ? onClick : undefined}
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * The Handle component is a UI element that is used to connect nodes.
 */
export const Handle = memo(fixedForwardRef(HandleComponent));
