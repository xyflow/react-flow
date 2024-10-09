import { useCallback, CSSProperties } from 'react';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';
import { Position, getNodeToolbarTransform, getInternalNodesBounds, NodeLookup } from '@xyflow/system';

import { InternalNode, ReactFlowState } from '../../types';
import { useStore } from '../../hooks/useStore';
import { useNodeId } from '../../contexts/NodeIdContext';
import { NodeToolbarPortal } from './NodeToolbarPortal';
import type { NodeToolbarProps } from './types';

const nodeEqualityFn = (a?: InternalNode, b?: InternalNode) =>
  a?.internals.positionAbsolute.x !== b?.internals.positionAbsolute.x ||
  a?.internals.positionAbsolute.y !== b?.internals.positionAbsolute.y ||
  a?.measured.width !== b?.measured.width ||
  a?.measured.height !== b?.measured.height ||
  a?.selected !== b?.selected ||
  a?.internals.z !== b?.internals.z;

const nodesEqualityFn = (a: NodeLookup, b: NodeLookup) => {
  if (a.size !== b.size) {
    return false;
  }

  for (const [key, node] of a) {
    if (nodeEqualityFn(node, b.get(key))) {
      return false;
    }
  }

  return true;
};

const storeSelector = (state: ReactFlowState) => ({
  x: state.transform[0],
  y: state.transform[1],
  zoom: state.transform[2],
  selectedNodesCount: state.nodes.filter((node) => node.selected).length,
});

export function NodeToolbar({
  nodeId,
  children,
  className,
  style,
  isVisible,
  position = Position.Top,
  offset = 10,
  align = 'center',
  ...rest
}: NodeToolbarProps) {
  const contextNodeId = useNodeId();

  const nodesSelector = useCallback(
    (state: ReactFlowState): NodeLookup => {
      const nodeIds = Array.isArray(nodeId) ? nodeId : [nodeId || contextNodeId || ''];
      const internalNodes = nodeIds.reduce<NodeLookup>((res, id) => {
        const node = state.nodeLookup.get(id);
        if (node) {
          res.set(node.id, node);
        }

        return res;
      }, new Map());

      return internalNodes;
    },
    [nodeId, contextNodeId]
  );
  const nodes = useStore(nodesSelector, nodesEqualityFn);
  const { x, y, zoom, selectedNodesCount } = useStore(storeSelector, shallow);

  // if isVisible is not set, we show the toolbar only if its node is selected and no other node is selected
  const isActive =
    typeof isVisible === 'boolean'
      ? isVisible
      : nodes.size === 1 && nodes.values().next().value?.selected && selectedNodesCount === 1;

  if (!isActive || !nodes.size) {
    return null;
  }

  const nodeRect = getInternalNodesBounds(nodes);
  const nodesArray = Array.from(nodes.values());
  const zIndex = Math.max(...nodesArray.map((node) => node.internals.z + 1));

  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    transform: getNodeToolbarTransform(nodeRect, { x, y, zoom }, position, offset, align),
    zIndex,
    ...style,
  };

  return (
    <NodeToolbarPortal>
      <div
        style={wrapperStyle}
        className={cc(['react-flow__node-toolbar', className])}
        {...rest}
        // @todo: check if we could only do this for non-prod envs
        data-id={nodesArray.reduce((acc, node) => `${acc}${node.id} `, '').trim()}
      >
        {children}
      </div>
    </NodeToolbarPortal>
  );
}
