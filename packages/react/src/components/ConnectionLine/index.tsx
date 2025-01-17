import { CSSProperties } from 'react';
import { shallow } from 'zustand/shallow';
import cc from 'classcat';
import {
  ConnectionLineType,
  getBezierPath,
  getSmoothStepPath,
  getConnectionStatus,
  getStraightPath,
} from '@xyflow/system';

import { useStore } from '../../hooks/useStore';
import { getSimpleBezierPath } from '../Edges/SimpleBezierEdge';
import type { ConnectionLineComponent, Node, ReactFlowState } from '../../types';
import { useConnection } from '../../hooks/useConnection';

type ConnectionLineWrapperProps<NodeType extends Node = Node> = {
  type: ConnectionLineType;
  component?: ConnectionLineComponent<NodeType>;
  containerStyle?: CSSProperties;
  style?: CSSProperties;
};

const selector = (s: ReactFlowState) => ({
  nodesConnectable: s.nodesConnectable,
  isValid: s.connection.isValid,
  inProgress: s.connection.inProgress,
  width: s.width,
  height: s.height,
});

export function ConnectionLineWrapper<NodeType extends Node = Node>({ containerStyle, style, type, component }: ConnectionLineWrapperProps<NodeType>) {
  const { nodesConnectable, width, height, isValid, inProgress } = useStore(selector, shallow);
  const renderConnection = !!(width && nodesConnectable && inProgress);

  if (!renderConnection) {
    return null;
  }

  return (
    <svg
      style={containerStyle}
      width={width}
      height={height}
      className="react-flow__connectionline react-flow__container"
    >
      <g className={cc(['react-flow__connection', getConnectionStatus(isValid)])}>
        <ConnectionLine style={style} type={type} CustomComponent={component} isValid={isValid} />
      </g>
    </svg>
  );
}

type ConnectionLineProps<NodeType extends Node = Node> = {
  type: ConnectionLineType;
  style?: CSSProperties;
  CustomComponent?: ConnectionLineComponent<NodeType>;
  isValid: boolean | null;
};

const ConnectionLine = <NodeType extends Node = Node> ({ style, type = ConnectionLineType.Bezier, CustomComponent, isValid }: ConnectionLineProps<NodeType>) => {
  const { inProgress, from, fromNode, fromHandle, fromPosition, to, toNode, toHandle, toPosition } = useConnection<NodeType>();

  if (!inProgress) {
    return;
  }

  if (CustomComponent) {
    return (
      <CustomComponent
        connectionLineType={type}
        connectionLineStyle={style}
        fromNode={fromNode}
        fromHandle={fromHandle}
        fromX={from.x}
        fromY={from.y}
        toX={to.x}
        toY={to.y}
        fromPosition={fromPosition}
        toPosition={toPosition}
        connectionStatus={getConnectionStatus(isValid)}
        toNode={toNode}
        toHandle={toHandle}
      />
    );
  }

  let path = '';

  const pathParams = {
    sourceX: from.x,
    sourceY: from.y,
    sourcePosition: fromPosition,
    targetX: to.x,
    targetY: to.y,
    targetPosition: toPosition,
  };

  switch (type) {
    case ConnectionLineType.Bezier:
      [path] = getBezierPath(pathParams);
      break;
    case ConnectionLineType.SimpleBezier:
      [path] = getSimpleBezierPath(pathParams);
      break;
    case ConnectionLineType.Step:
      [path] = getSmoothStepPath({
        ...pathParams,
        borderRadius: 0,
      });
      break;
    case ConnectionLineType.SmoothStep:
      [path] = getSmoothStepPath(pathParams);
      break;
    default:
      [path] = getStraightPath(pathParams);
  }

  return <path d={path} fill="none" className="react-flow__connection-path" style={style} />;
};

ConnectionLine.displayName = 'ConnectionLine';
