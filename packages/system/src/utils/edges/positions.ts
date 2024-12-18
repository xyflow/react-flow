import { EdgePosition } from '../../types/edges';
import { ConnectionMode, OnError } from '../../types/general';
import { InternalNodeBase, NodeHandle } from '../../types/nodes';
import { Position, XYPosition } from '../../types/utils';
import { Handle } from '../../types';
import { getNodeDimensions } from '../general';
import { XYError, XYErrorCode } from '../../xyerror';

export type GetEdgePositionParams = {
  id: string;
  sourceNode: InternalNodeBase;
  sourceHandle: string | null;
  targetNode: InternalNodeBase;
  targetHandle: string | null;
  connectionMode: ConnectionMode;
  onError?: OnError;
};

function isNodeInitialized(node: InternalNodeBase): boolean {
  return (
    node &&
    !!(node.internals.handleBounds || node.handles?.length) &&
    !!(node.measured.width || node.width || node.initialWidth)
  );
}

export function getEdgePosition(params: GetEdgePositionParams): EdgePosition | null {
  const { sourceNode, targetNode } = params;

  if (!isNodeInitialized(sourceNode) || !isNodeInitialized(targetNode)) {
    return null;
  }

  const sourceHandleBounds = sourceNode.internals.handleBounds || toHandleBounds(sourceNode.handles);
  const targetHandleBounds = targetNode.internals.handleBounds || toHandleBounds(targetNode.handles);

  const sourceHandle = getHandle(sourceHandleBounds?.source ?? [], params.sourceHandle);
  const targetHandle = getHandle(
    // when connection type is loose we can define all handles as sources and connect source -> source
    params.connectionMode === ConnectionMode.Strict
      ? targetHandleBounds?.target ?? []
      : (targetHandleBounds?.target ?? []).concat(targetHandleBounds?.source ?? []),
    params.targetHandle
  );

  if (!sourceHandle || !targetHandle) {
    const error = new XYError(XYErrorCode.EDGE_SOURCE_TARGET_HANDLE_NOT_FOUND, !sourceHandle ? 'source' : 'target', {
      id: params.id,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
    });

    params.onError?.(error.code, error.message, error);

    return null;
  }

  const sourcePosition = sourceHandle?.position || Position.Bottom;
  const targetPosition = targetHandle?.position || Position.Top;
  const source = getHandlePosition(sourceNode, sourceHandle, sourcePosition);
  const target = getHandlePosition(targetNode, targetHandle, targetPosition);

  return {
    sourceX: source.x,
    sourceY: source.y,
    targetX: target.x,
    targetY: target.y,
    sourcePosition,
    targetPosition,
  };
}

function toHandleBounds(handles?: NodeHandle[]) {
  if (!handles) {
    return null;
  }

  const source = [];
  const target = [];

  for (const handle of handles) {
    handle.width = handle.width ?? 1;
    handle.height = handle.height ?? 1;

    if (handle.type === 'source') {
      source.push(handle as Handle);
    } else if (handle.type === 'target') {
      target.push(handle as Handle);
    }
  }

  return {
    source,
    target,
  };
}

export function getHandlePosition(
  node: InternalNodeBase,
  handle: Handle | null,
  fallbackPosition: Position = Position.Left,
  center = false
): XYPosition {
  const x = (handle?.x ?? 0) + node.internals.positionAbsolute.x;
  const y = (handle?.y ?? 0) + node.internals.positionAbsolute.y;
  const { width, height } = handle ?? getNodeDimensions(node);

  if (center) {
    return { x: x + width / 2, y: y + height / 2 };
  }

  const position = handle?.position ?? fallbackPosition;

  switch (position) {
    case Position.Top:
      return { x: x + width / 2, y };
    case Position.Right:
      return { x: x + width, y: y + height / 2 };
    case Position.Bottom:
      return { x: x + width / 2, y: y + height };
    case Position.Left:
      return { x, y: y + height / 2 };
  }
}

function getHandle(bounds: Handle[], handleId?: string | null): Handle | null {
  if (!bounds) {
    return null;
  }

  // if no handleId is given, we use the first handle, otherwise we check for the id
  return (!handleId ? bounds[0] : bounds.find((d) => d.id === handleId)) || null;
}
