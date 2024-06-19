import { derived, type Writable } from 'svelte/store';
import {
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  ConnectionLineType,
  ConnectionMode,
  Position,
  type HandleElement
} from '@xyflow/system';

import type { SvelteFlowStoreState } from './types';
import type { ConnectionData } from '$lib/types';

export type ConnectionProps = {
  path: string | null;
  sourceX: number | null;
  sourceY: number | null;
  sourcePosition: Position | undefined | null;
  targetX: number | null;
  targetY: number | null;
  targetPosition: Position | undefined | null;
  pointerPosition: ConnectionData['connectionPosition'] | null;
  startHandle: ConnectionData['connectionStartHandle'] | null;
  endHandle: ConnectionData['connectionEndHandle'] | null;
  status: ConnectionData['connectionStatus'] | null;
};

export const initConnectionProps = {
  path: null,
  sourceX: null,
  sourceY: null,
  sourcePosition: null,
  targetX: null,
  targetY: null,
  targetPosition: null,
  pointerPosition: null,
  startHandle: null,
  endHandle: null,
  status: null
};

const oppositePosition = {
  [Position.Left]: Position.Right,
  [Position.Right]: Position.Left,
  [Position.Top]: Position.Bottom,
  [Position.Bottom]: Position.Top
};

export function getDerivedConnectionProps(
  store: SvelteFlowStoreState,
  currentConnection: Writable<ConnectionData>
) {
  return derived(
    [
      currentConnection,
      store.connectionLineType,
      store.connectionMode,
      store.nodeLookup,
      store.viewport
    ],
    ([connection, connectionLineType, connectionMode, nodeLookup, viewport]) => {
      if (!connection.connectionStartHandle?.nodeId) {
        return initConnectionProps;
      }

      // TODO: it should bail out if the node is not found
      const fromNode = nodeLookup.get(connection.connectionStartHandle?.nodeId);
      const fromHandleBounds = fromNode?.internals.handleBounds;
      const handleBoundsStrict =
        fromHandleBounds?.[connection.connectionStartHandle.type || 'source'] || [];
      const handleBoundsLoose: HandleElement[] | undefined | null = handleBoundsStrict
        ? handleBoundsStrict
        : fromHandleBounds?.[
            connection?.connectionStartHandle?.type === 'source' ? 'target' : 'source'
          ];
      const handleBounds =
        connectionMode === ConnectionMode.Strict ? handleBoundsStrict : handleBoundsLoose;
      const fromHandle = connection.connectionStartHandle?.handleId
        ? handleBounds?.find((d) => d.id === connection.connectionStartHandle?.handleId)
        : handleBounds?.[0];
      const fromHandleX = fromHandle
        ? fromHandle.x + fromHandle.width / 2
        : (fromNode?.measured.width ?? 0) / 2;
      const fromHandleY = fromHandle
        ? fromHandle.y + fromHandle.height / 2
        : fromNode?.measured.height ?? 0;
      const fromX = (fromNode?.internals.positionAbsolute.x ?? 0) + fromHandleX;
      const fromY = (fromNode?.internals.positionAbsolute.y ?? 0) + fromHandleY;
      const fromPosition = fromHandle?.position;
      const toPosition =
        connection.connectionEndHandle?.position ??
        (fromPosition ? oppositePosition[fromPosition] : undefined);

      const pathParams = {
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: ((connection.connectionPosition?.x ?? 0) - viewport.x) / viewport.zoom,
        targetY: ((connection.connectionPosition?.y ?? 0) - viewport.y) / viewport.zoom,
        targetPosition: toPosition
      };

      let path = '';

      if (connectionLineType === ConnectionLineType.Bezier) {
        // we assume the destination position is opposite to the source position
        [path] = getBezierPath(pathParams);
      } else if (connectionLineType === ConnectionLineType.Step) {
        [path] = getSmoothStepPath({
          ...pathParams,
          borderRadius: 0
        });
      } else if (connectionLineType === ConnectionLineType.SmoothStep) {
        [path] = getSmoothStepPath(pathParams);
      } else {
        [path] = getStraightPath(pathParams);
      }

      return {
        path,
        ...pathParams,
        pointerPosition: connection.connectionPosition,
        startHandle: connection.connectionStartHandle,
        endHandle: connection.connectionEndHandle,
        status: connection.connectionStatus
      };
    }
  );
}
