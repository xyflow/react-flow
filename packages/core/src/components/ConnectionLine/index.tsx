import React, { CSSProperties, useCallback } from 'react';
import shallow from 'zustand/shallow';

import { useStore } from '../../store';
import { getBezierPath } from '../Edges/BezierEdge';
import { getSmoothStepPath } from '../Edges/SmoothStepEdge';
import { ConnectionLineType, ConnectionLineComponent, HandleType, Position } from '../../types';
import { getSimpleBezierPath } from '../Edges/SimpleBezierEdge';
import { internalsSymbol } from '../../utils';

type ConnectionLineProps = {
  connectionNodeId: string;
  connectionHandleType: HandleType;
  connectionLineType: ConnectionLineType;
  isConnectable: boolean;
  connectionLineStyle?: CSSProperties;
  CustomConnectionLineComponent?: ConnectionLineComponent;
};

const oppositePosition = {
  [Position.Left]: Position.Right,
  [Position.Right]: Position.Left,
  [Position.Top]: Position.Bottom,
  [Position.Bottom]: Position.Top,
};

export default ({
  connectionNodeId,
  connectionHandleType,
  connectionLineStyle,
  connectionLineType = ConnectionLineType.Bezier,
  isConnectable,
  CustomConnectionLineComponent,
}: ConnectionLineProps) => {
  const { fromNode, handleId, toX, toY } = useStore(
    useCallback(
      (s) => ({
        fromNode: s.nodeInternals.get(connectionNodeId),
        handleId: s.connectionHandleId,
        toX: (s.connectionPosition.x - s.transform[0]) / s.transform[2],
        toY: (s.connectionPosition.y - s.transform[1]) / s.transform[2],
      }),
      [connectionNodeId]
    ),
    shallow
  );
  const fromHandleBounds = fromNode?.[internalsSymbol]?.handleBounds;

  if (!fromNode || !isConnectable || !fromHandleBounds?.[connectionHandleType]) {
    return null;
  }

  const handleBound = fromHandleBounds[connectionHandleType]!;
  const fromHandle = handleId ? handleBound.find((d) => d.id === handleId) : handleBound[0];
  const fromHandleX = fromHandle ? fromHandle.x + fromHandle.width / 2 : (fromNode?.width ?? 0) / 2;
  const fromHandleY = fromHandle ? fromHandle.y + fromHandle.height / 2 : fromNode?.height ?? 0;
  const fromX = (fromNode?.positionAbsolute?.x || 0) + fromHandleX;
  const fromY = (fromNode?.positionAbsolute?.y || 0) + fromHandleY;

  const fromPosition = fromHandle?.position;

  if (!fromPosition) {
    return null;
  }

  let toPosition: Position = oppositePosition[fromPosition];

  if (CustomConnectionLineComponent) {
    return (
      <g className="react-flow__connection">
        <CustomConnectionLineComponent
          connectionLineType={connectionLineType}
          connectionLineStyle={connectionLineStyle}
          fromNode={fromNode}
          fromHandle={fromHandle}
          fromX={fromX}
          fromY={fromY}
          toX={toX}
          toY={toY}
          fromPosition={fromPosition}
          toPosition={toPosition}
        />
      </g>
    );
  }

  let dAttr: string = '';

  const pathParams = {
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  };

  if (connectionLineType === ConnectionLineType.Bezier) {
    // we assume the destination position is opposite to the source position
    dAttr = getBezierPath(pathParams);
  } else if (connectionLineType === ConnectionLineType.Step) {
    dAttr = getSmoothStepPath({
      ...pathParams,
      borderRadius: 0,
    });
  } else if (connectionLineType === ConnectionLineType.SmoothStep) {
    dAttr = getSmoothStepPath(pathParams);
  } else if (connectionLineType === ConnectionLineType.SimpleBezier) {
    dAttr = getSimpleBezierPath(pathParams);
  } else {
    dAttr = `M${fromX},${fromY} ${toX},${toY}`;
  }

  return (
    <g className="react-flow__connection">
      <path d={dAttr} fill="none" className="react-flow__connection-path" style={connectionLineStyle} />
    </g>
  );
};
