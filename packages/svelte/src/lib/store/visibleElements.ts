import type { Edge, EdgeLayouted, InternalNode } from '$lib/types';
import {
  ConnectionMode,
  getEdgePosition,
  getElevatedEdgeZIndex,
  getNodesInside,
  isEdgeVisible,
  type NodeLookup,
  type OnError,
  type Transform
} from '@xyflow/system';

export function getVisibleNodes(
  nodeLookup: NodeLookup,
  transform: Transform,
  width: number,
  height: number
) {
  const visibleNodes = new Map<string, InternalNode>();
  getNodesInside(nodeLookup, { x: 0, y: 0, width: width, height: height }, transform, true).forEach(
    (node) => {
      visibleNodes.set(node.id, node);
    }
  );
  return visibleNodes;
}

export interface EdgeLayoutBaseOptions {
  edges: Edge[];
  previousEdges: Map<string, EdgeLayouted>;
  nodeLookup: NodeLookup;
  connectionMode: ConnectionMode;
  onerror: OnError;
}

export interface EdgeLayoutAllOptions extends EdgeLayoutBaseOptions {
  onlyRenderVisible: never;
  visibleNodes: never;
  transform: never;
  width: never;
  height: never;
}

export interface EdgeLayoutOnlyVisibleOptions extends EdgeLayoutBaseOptions {
  visibleNodes: Map<string, InternalNode>;
  transform: Transform;
  width: number;
  height: number;
  onlyRenderVisible: true;
}

export type EdgeLayoutOptions = EdgeLayoutAllOptions | EdgeLayoutOnlyVisibleOptions;

export function getLayoutedEdges(options: EdgeLayoutOptions): Map<string, EdgeLayouted> {
  const { edges, nodeLookup, previousEdges, connectionMode, onerror, onlyRenderVisible } = options;
  const layoutedEdges = new Map<string, EdgeLayouted>();
  for (const edge of edges) {
    const sourceNode = nodeLookup.get(edge.source);
    const targetNode = nodeLookup.get(edge.target);

    if (!sourceNode || !targetNode) {
      continue;
    }

    if (onlyRenderVisible) {
      const { visibleNodes, transform, width, height } = options;
      if (
        isEdgeVisible({
          sourceNode,
          targetNode,
          width: width!,
          height: height!,
          transform: transform!
        })
      ) {
        visibleNodes!.set(sourceNode.id, sourceNode);
        visibleNodes!.set(targetNode.id, targetNode);
      } else {
        continue;
      }
    }

    // we reuse the previous edge object if
    // the current and previous edge are the same
    // and the source and target node are the same
    // and references to internalNodes are the same
    const previous = previousEdges.get(edge.id);
    if (
      previous &&
      edge === previous.edge &&
      sourceNode == previous.sourceNode &&
      targetNode == previous.targetNode
    ) {
      layoutedEdges.set(edge.id, previous);
      continue;
    }

    const edgePosition = getEdgePosition({
      id: edge.id,
      sourceNode,
      targetNode,
      sourceHandle: edge.sourceHandle || null,
      targetHandle: edge.targetHandle || null,
      connectionMode,
      onError: onerror
    });

    if (edgePosition) {
      layoutedEdges.set(edge.id, {
        ...edge,
        zIndex: getElevatedEdgeZIndex({
          selected: edge.selected,
          zIndex: edge.zIndex,
          sourceNode,
          targetNode,
          elevateOnSelect: false
        }),
        ...edgePosition,
        sourceNode,
        targetNode,
        edge
      });
    }
  }

  return layoutedEdges;
}
