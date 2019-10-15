import React, { useRef, useEffect, CSSProperties } from 'react';
import classnames from 'classnames';

import { useStoreState } from '../../store/hooks';
import { getNodesInside } from '../../utils/graph';
import { Node } from '../../types';

type StringFunc = (node: Node) => string;

interface MiniMapProps {
  style?: CSSProperties;
  className?: string | null;
  bgColor?: string;
  nodeColor?: string | StringFunc;
};

const baseStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 5,
  bottom: 10,
  right: 10,
  width: 200
};

export default (
  { style = {}, className, bgColor = '#f8f8f8', nodeColor = '#ddd' }: MiniMapProps
) => {
  const canvasNode = useRef(null);
  const state = useStoreState(s => ({
    width: s.width,
    height: s.height,
    nodes: s.nodes,
    transform: s.transform,
  }));
  const mapClasses = classnames('react-flow__minimap', className);
  const nodePositions = state.nodes.map(n => n.__rg.position);
  const width: number = +(style.width || baseStyle.width || 0);
  const height = (state.height / (state.width || 1)) * width;
  const bbox = { x: 0, y: 0, width: state.width, height: state.height };
  const scaleFactor = width / state.width;
  const nodeColorFunc = (nodeColor instanceof Function ? nodeColor: () => nodeColor) as StringFunc;

  useEffect(() => {
    if (canvasNode && canvasNode.current) {
      const ctx = canvasNode.current.getContext('2d');
      const nodesInside = getNodesInside(state.nodes, bbox, state.transform, true);

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      nodesInside.forEach((n) => {
        const pos = n.__rg.position;
        const transformX = state.transform[0];
        const transformY = state.transform[1];
        const x = (pos.x * state.transform[2]) + transformX;
        const y = (pos.y * state.transform[2]) + transformY;

        ctx.fillStyle = nodeColorFunc(n);

        ctx.fillRect(
          (x * scaleFactor),
          (y * scaleFactor),
          n.__rg.width * scaleFactor * state.transform[2],
          n.__rg.height * scaleFactor * state.transform[2]
        );
      });
    }
  }, [canvasNode.current, nodePositions, state.transform, height])

  return (
    <canvas
      style={{
        ...baseStyle,
        ...style,
        height
      }}
      width={width}
      height={height}
      className={mapClasses}
      ref={canvasNode}
    />
  );
}
