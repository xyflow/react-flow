/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  boxToRect,
  clampPosition,
  getBoundsOfBoxes,
  getOverlappingArea,
  nodeToRect,
  pointToRendererPoint,
  getViewportForBounds,
  isCoordinateExtent,
  getNodeDimensions,
  nodeToBox,
} from './general';
import {
  type Transform,
  type XYPosition,
  type Rect,
  type NodeOrigin,
  type NodeBase,
  type EdgeBase,
  type FitViewParamsBase,
  type FitViewOptionsBase,
  CoordinateExtent,
  OnError,
  OnBeforeDeleteBase,
  NodeLookup,
  InternalNodeBase,
  NodeDragItem,
} from '../types';
import { XYError, XYErrorCode } from '../xyerror';

/**
 * Test whether an object is useable as an Edge
 * @public
 * @remarks In TypeScript this is a type guard that will narrow the type of whatever you pass in to Edge if it returns true
 * @param element - The element to test
 * @returns A boolean indicating whether the element is an Edge
 */
export const isEdgeBase = <EdgeType extends EdgeBase = EdgeBase>(element: any): element is EdgeType =>
  'id' in element && 'source' in element && 'target' in element;

/**
 * Test whether an object is useable as a Node
 * @public
 * @remarks In TypeScript this is a type guard that will narrow the type of whatever you pass in to Node if it returns true
 * @param element - The element to test
 * @returns A boolean indicating whether the element is an Node
 */
export const isNodeBase = <NodeType extends NodeBase = NodeBase>(element: any): element is NodeType =>
  'id' in element && 'position' in element && !('source' in element) && !('target' in element);

export const isInternalNodeBase = <NodeType extends InternalNodeBase = InternalNodeBase>(
  element: any
): element is NodeType => 'id' in element && 'internals' in element && !('source' in element) && !('target' in element);

/**
 * Pass in a node, and get connected nodes where edge.source === node.id
 * @public
 * @param node - The node to get the connected nodes from
 * @param nodes - The array of all nodes
 * @param edges - The array of all edges
 * @returns An array of nodes that are connected over eges where the source is the given node
 */
export const getOutgoers = <NodeType extends NodeBase = NodeBase, EdgeType extends EdgeBase = EdgeBase>(
  node: NodeType | { id: string },
  nodes: NodeType[],
  edges: EdgeType[]
): NodeType[] => {
  if (!node.id) {
    return [];
  }

  const outgoerIds = new Set();
  edges.forEach((edge) => {
    if (edge.source === node.id) {
      outgoerIds.add(edge.target);
    }
  });

  return nodes.filter((n) => outgoerIds.has(n.id));
};

/**
 * Pass in a node, and get connected nodes where edge.target === node.id
 * @public
 * @param node - The node to get the connected nodes from
 * @param nodes - The array of all nodes
 * @param edges - The array of all edges
 * @returns An array of nodes that are connected over eges where the target is the given node
 */
export const getIncomers = <NodeType extends NodeBase = NodeBase, EdgeType extends EdgeBase = EdgeBase>(
  node: NodeType | { id: string },
  nodes: NodeType[],
  edges: EdgeType[]
): NodeType[] => {
  if (!node.id) {
    return [];
  }
  const incomersIds = new Set();
  edges.forEach((edge) => {
    if (edge.target === node.id) {
      incomersIds.add(edge.source);
    }
  });

  return nodes.filter((n) => incomersIds.has(n.id));
};

export const getNodePositionWithOrigin = (node: NodeBase, nodeOrigin: NodeOrigin = [0, 0]): XYPosition => {
  const { width, height } = getNodeDimensions(node);
  const origin = node.origin ?? nodeOrigin;
  const offsetX = width * origin[0];
  const offsetY = height * origin[1];

  return {
    x: node.position.x - offsetX,
    y: node.position.y - offsetY,
  };
};

export type GetNodesBoundsParams<NodeType extends NodeBase = NodeBase> = {
  nodeOrigin?: NodeOrigin;
  nodeLookup?: NodeLookup<InternalNodeBase<NodeType>>;
};

/**
 * Internal function for determining a bounding box that contains all given nodes in an array.
 * @public
 * @remarks Useful when combined with {@link getViewportForBounds} to calculate the correct transform to fit the given nodes in a viewport.
 * @param nodes - Nodes to calculate the bounds for
 * @param params.nodeOrigin - Origin of the nodes: [0, 0] - top left, [0.5, 0.5] - center
 * @returns Bounding box enclosing all nodes
 */
export const getNodesBounds = <NodeType extends NodeBase = NodeBase>(
  nodes: (NodeType | InternalNodeBase<NodeType> | string)[],
  params: GetNodesBoundsParams<NodeType> = { nodeOrigin: [0, 0], nodeLookup: undefined }
): Rect => {
  if (process.env.NODE_ENV === 'development' && !params.nodeLookup) {
    console.warn(
      'Please use `getNodesBounds` from `useReactFlow`/`useSvelteFlow` hook to ensure correct values for sub flows. If not possible, you have to provide a nodeLookup to support sub flows.'
    );
  }

  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const box = nodes.reduce(
    (currBox, nodeOrId) => {
      const isId = typeof nodeOrId === 'string';
      let currentNode = !params.nodeLookup && !isId ? nodeOrId : undefined;

      if (params.nodeLookup) {
        currentNode = isId
          ? params.nodeLookup.get(nodeOrId)
          : !isInternalNodeBase(nodeOrId)
          ? params.nodeLookup.get(nodeOrId.id)
          : nodeOrId;
      }

      const nodeBox = currentNode ? nodeToBox(currentNode, params.nodeOrigin) : { x: 0, y: 0, x2: 0, y2: 0 };
      return getBoundsOfBoxes(currBox, nodeBox);
    },
    { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity }
  );

  return boxToRect(box);
};

export type GetInternalNodesBoundsParams<NodeType> = {
  useRelativePosition?: boolean;
  filter?: (node: NodeType) => boolean;
};

/**
 * Determines a bounding box that contains all given nodes in an array
 * @internal
 */
export const getInternalNodesBounds = <NodeType extends InternalNodeBase | NodeDragItem>(
  nodeLookup: Map<string, NodeType>,
  params: GetInternalNodesBoundsParams<NodeType> = {}
): Rect => {
  if (nodeLookup.size === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let box = { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity };

  nodeLookup.forEach((node) => {
    if (params.filter === undefined || params.filter(node)) {
      const nodeBox = nodeToBox(node as InternalNodeBase);
      box = getBoundsOfBoxes(box, nodeBox);
    }
  });

  return boxToRect(box);
};

export const getNodesInside = <NodeType extends NodeBase = NodeBase>(
  nodes: Map<string, InternalNodeBase<NodeType>>,
  rect: Rect,
  [tx, ty, tScale]: Transform = [0, 0, 1],
  partially = false,
  // set excludeNonSelectableNodes if you want to pay attention to the nodes "selectable" attribute
  excludeNonSelectableNodes = false
): InternalNodeBase<NodeType>[] => {
  const paneRect = {
    ...pointToRendererPoint(rect, [tx, ty, tScale]),
    width: rect.width / tScale,
    height: rect.height / tScale,
  };

  const visibleNodes: InternalNodeBase<NodeType>[] = [];

  for (const node of nodes.values()) {
    const { measured, selectable = true, hidden = false } = node;

    if ((excludeNonSelectableNodes && !selectable) || hidden) {
      continue;
    }

    const width = measured.width ?? node.width ?? node.initialWidth ?? null;
    const height = measured.height ?? node.height ?? node.initialHeight ?? null;

    const overlappingArea = getOverlappingArea(paneRect, nodeToRect(node));
    const area = (width ?? 0) * (height ?? 0);

    const partiallyVisible = partially && overlappingArea > 0;
    const forceInitialRender = !node.internals.handleBounds;
    const isVisible = forceInitialRender || partiallyVisible || overlappingArea >= area;

    if (isVisible || node.dragging) {
      visibleNodes.push(node);
    }
  }

  return visibleNodes;
};

/**
 * Get all connecting edges for a given set of nodes
 * @param nodes - Nodes you want to get the connected edges for
 * @param edges - All edges
 * @returns Array of edges that connect any of the given nodes with each other
 */
export const getConnectedEdges = <NodeType extends NodeBase = NodeBase, EdgeType extends EdgeBase = EdgeBase>(
  nodes: NodeType[],
  edges: EdgeType[]
): EdgeType[] => {
  const nodeIds = new Set();
  nodes.forEach((node) => {
    nodeIds.add(node.id);
  });

  return edges.filter((edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target));
};

export function getFitViewNodes<
  Params extends NodeLookup<InternalNodeBase<NodeBase>>,
  Options extends FitViewOptionsBase<NodeBase>
>(nodeLookup: Params, options?: Pick<Options, 'nodes' | 'includeHiddenNodes'>) {
  const fitViewNodes: NodeLookup = new Map();
  const optionNodeIds = options?.nodes ? new Set(options.nodes.map((node) => node.id)) : null;

  nodeLookup.forEach((n) => {
    const isVisible = n.measured.width && n.measured.height && (options?.includeHiddenNodes || !n.hidden);

    if (isVisible && (!optionNodeIds || optionNodeIds.has(n.id))) {
      fitViewNodes.set(n.id, n);
    }
  });

  return fitViewNodes;
}

export async function fitView<Params extends FitViewParamsBase<NodeBase>, Options extends FitViewOptionsBase<NodeBase>>(
  { nodes, width, height, panZoom, minZoom, maxZoom }: Params,
  options?: Omit<Options, 'nodes' | 'includeHiddenNodes'>
): Promise<boolean> {
  if (nodes.size === 0) {
    return Promise.resolve(false);
  }

  const bounds = getInternalNodesBounds(nodes);

  const viewport = getViewportForBounds(
    bounds,
    width,
    height,
    options?.minZoom ?? minZoom,
    options?.maxZoom ?? maxZoom,
    options?.padding ?? 0.1
  );

  await panZoom.setViewport(viewport, { duration: options?.duration });

  return Promise.resolve(true);
}

/**
 * This function calculates the next position of a node, taking into account the node's extent, parent node, and origin.
 *
 * @internal
 * @returns position, positionAbsolute
 */
export function calculateNodePosition<NodeType extends NodeBase>({
  nodeId,
  nextPosition,
  nodeLookup,
  nodeOrigin = [0, 0],
  nodeExtent,
  onError,
}: {
  nodeId: string;
  nextPosition: XYPosition;
  nodeLookup: NodeLookup<InternalNodeBase<NodeType>>;
  nodeOrigin?: NodeOrigin;
  nodeExtent?: CoordinateExtent;
  onError?: OnError;
}): { position: XYPosition; positionAbsolute: XYPosition } {
  const node = nodeLookup.get(nodeId)!;
  const parentNode = node.parentId ? nodeLookup.get(node.parentId) : undefined;
  const { x: parentX, y: parentY } = parentNode ? parentNode.internals.positionAbsolute : { x: 0, y: 0 };

  const origin = node.origin ?? nodeOrigin;
  let extent = nodeExtent;

  if (node.extent === 'parent' && !node.expandParent) {
    if (!parentNode) {
      const error = new XYError(XYErrorCode.NODE_EXTENT_INVALID);
      onError?.(error.code, error.message, error);
    } else {
      const parentWidth = parentNode.measured.width;
      const parentHeight = parentNode.measured.height;

      if (parentWidth && parentHeight) {
        extent = [
          [parentX, parentY],
          [parentX + parentWidth, parentY + parentHeight],
        ];
      }
    }
  } else if (parentNode && isCoordinateExtent(node.extent)) {
    extent = [
      [node.extent[0][0] + parentX, node.extent[0][1] + parentY],
      [node.extent[1][0] + parentX, node.extent[1][1] + parentY],
    ];
  }

  const positionAbsolute = isCoordinateExtent(extent)
    ? clampPosition(nextPosition, extent, node.measured)
    : nextPosition;

  return {
    position: {
      x: positionAbsolute.x - parentX + node.measured.width! * origin[0],
      y: positionAbsolute.y - parentY + node.measured.height! * origin[1],
    },
    positionAbsolute,
  };
}

/**
 * Pass in nodes & edges to delete, get arrays of nodes and edges that actually can be deleted
 * @internal
 * @param param.nodesToRemove - The nodes to remove
 * @param param.edgesToRemove - The edges to remove
 * @param param.nodes - All nodes
 * @param param.edges - All edges
 * @param param.onBeforeDelete - Callback to check which nodes and edges can be deleted
 * @returns nodes: nodes that can be deleted, edges: edges that can be deleted
 */
export async function getElementsToRemove<NodeType extends NodeBase = NodeBase, EdgeType extends EdgeBase = EdgeBase>({
  nodesToRemove = [],
  edgesToRemove = [],
  nodes,
  edges,
  onBeforeDelete,
}: {
  nodesToRemove: Partial<NodeType>[];
  edgesToRemove: Partial<EdgeType>[];
  nodes: NodeType[];
  edges: EdgeType[];
  onBeforeDelete?: OnBeforeDeleteBase<NodeType, EdgeType>;
}): Promise<{
  nodes: NodeType[];
  edges: EdgeType[];
}> {
  const nodeIds = new Set(nodesToRemove.map((node) => node.id));
  const matchingNodes: NodeType[] = [];

  for (const node of nodes) {
    if (node.deletable === false) {
      continue;
    }

    const isIncluded = nodeIds.has(node.id);
    const parentHit = !isIncluded && node.parentId && matchingNodes.find((n) => n.id === node.parentId);

    if (isIncluded || parentHit) {
      matchingNodes.push(node);
    }
  }

  const edgeIds = new Set(edgesToRemove.map((edge) => edge.id));
  const deletableEdges = edges.filter((edge) => edge.deletable !== false);
  const connectedEdges = getConnectedEdges(matchingNodes, deletableEdges);
  const matchingEdges: EdgeType[] = connectedEdges;

  for (const edge of deletableEdges) {
    const isIncluded = edgeIds.has(edge.id);

    if (isIncluded && !matchingEdges.find((e) => e.id === edge.id)) {
      matchingEdges.push(edge);
    }
  }

  if (!onBeforeDelete) {
    return {
      edges: matchingEdges,
      nodes: matchingNodes,
    };
  }

  const onBeforeDeleteResult = await onBeforeDelete({
    nodes: matchingNodes,
    edges: matchingEdges,
  });

  if (typeof onBeforeDeleteResult === 'boolean') {
    return onBeforeDeleteResult ? { edges: matchingEdges, nodes: matchingNodes } : { edges: [], nodes: [] };
  }

  return onBeforeDeleteResult;
}
