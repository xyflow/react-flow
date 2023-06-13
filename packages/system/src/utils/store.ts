import { internalsSymbol } from '../constants';
import {
  BaseNode,
  CoordinateExtent,
  Dimensions,
  NodeDimensionUpdate,
  NodeOrigin,
  PanZoomInstance,
  Transform,
  XYPosition,
  XYZPosition,
} from '../types';
import { getDimensions, getHandleBounds } from './dom';
import { isNumeric } from './general';
import { getNodePositionWithOrigin } from './graph';

type ParentNodes = Record<string, boolean>;

export function updateAbsolutePositions<NodeType extends BaseNode>(
  nodes: NodeType[],
  nodeOrigin: NodeOrigin = [0, 0],
  parentNodes?: ParentNodes
) {
  return nodes.map((node) => {
    if (node.parentNode && !nodes.find((n) => n.id === node.parentNode)) {
      throw new Error(`Parent node ${node.parentNode} not found`);
    }

    if (node.parentNode || parentNodes?.[node.id]) {
      const parentNode = node.parentNode ? nodes.find((n) => n.id === node.parentNode) : null;
      const { x, y, z } = calculateXYZPosition(
        node,
        nodes,
        {
          ...node.position,
          z: node[internalsSymbol]?.z ?? 0,
        },
        parentNode?.origin || nodeOrigin
      );

      node.positionAbsolute = {
        x,
        y,
      };

      node[internalsSymbol]!.z = z;

      if (parentNodes?.[node.id]) {
        node[internalsSymbol]!.isParent = true;
      }
    }

    return node;
  });
}

type UpdateNodesOptions<NodeType extends BaseNode> = {
  nodeOrigin?: NodeOrigin;
  elevateNodesOnSelect?: boolean;
  defaults?: Partial<NodeType>;
};

export function updateNodes<NodeType extends BaseNode>(
  nodes: NodeType[],
  storeNodes: NodeType[],
  options: UpdateNodesOptions<NodeType> = {
    nodeOrigin: [0, 0] as NodeOrigin,
    elevateNodesOnSelect: true,
    defaults: {},
  }
): NodeType[] {
  const parentNodes: ParentNodes = {};
  const selectedNodeZ: number = options?.elevateNodesOnSelect ? 1000 : 0;

  const nextNodes = nodes.map((n) => {
    const currentStoreNode = storeNodes.find((storeNode) => n.id === storeNode.id);
    const node: NodeType = {
      ...options.defaults,
      ...n,
      positionAbsolute: n.position,
      width: n.width || currentStoreNode?.width,
      height: n.height || currentStoreNode?.height,
    };
    const z = (isNumeric(n.zIndex) ? n.zIndex : 0) + (n.selected ? selectedNodeZ : 0);
    const currInternals = n?.[internalsSymbol] || currentStoreNode?.[internalsSymbol];

    if (node.parentNode) {
      parentNodes[node.parentNode] = true;
    }

    Object.defineProperty(node, internalsSymbol, {
      enumerable: false,
      value: {
        handleBounds: currInternals?.handleBounds,
        z,
      },
    });

    return node;
  });

  const nodesWithPositions = updateAbsolutePositions(nextNodes, options.nodeOrigin, parentNodes);

  return nodesWithPositions;
}

function calculateXYZPosition<NodeType extends BaseNode>(
  node: NodeType,
  nodes: NodeType[],
  result: XYZPosition,
  nodeOrigin: NodeOrigin
): XYZPosition {
  if (!node.parentNode) {
    return result;
  }

  const parentNode = nodes.find((n) => n.id === node.parentNode)!;
  const parentNodePosition = getNodePositionWithOrigin(parentNode, parentNode?.origin || nodeOrigin);

  return calculateXYZPosition(
    parentNode,
    nodes,
    {
      x: (result.x ?? 0) + parentNodePosition.x,
      y: (result.y ?? 0) + parentNodePosition.y,
      z: (parentNode[internalsSymbol]?.z ?? 0) > (result.z ?? 0) ? parentNode[internalsSymbol]?.z ?? 0 : result.z ?? 0,
    },
    parentNode.origin || nodeOrigin
  );
}

export function updateNodeDimensions(
  updates: NodeDimensionUpdate[],
  nodes: BaseNode[],
  domNode: HTMLElement | null,
  nodeOrigin?: NodeOrigin,
  onUpdate?: (id: string, dimensions: Dimensions) => void
): BaseNode[] | null {
  const viewportNode = domNode?.querySelector('.xyflow__viewport');

  if (!viewportNode) {
    return null;
  }

  const style = window.getComputedStyle(viewportNode);
  const { m22: zoom } = new window.DOMMatrixReadOnly(style.transform);

  const nextNodes = nodes.map((node) => {
    const update = updates.find((u) => u.id === node.id);
    if (update) {
      const dimensions = getDimensions(update.nodeElement);
      const doUpdate = !!(
        dimensions.width &&
        dimensions.height &&
        (node.width !== dimensions.width || node.height !== dimensions.height || update.forceUpdate)
      );

      if (doUpdate) {
        onUpdate?.(node.id, dimensions);

        return {
          ...node,
          ...dimensions,
          [internalsSymbol]: {
            ...node[internalsSymbol],
            handleBounds: {
              source: getHandleBounds('.source', update.nodeElement, zoom, node.origin || nodeOrigin),
              target: getHandleBounds('.target', update.nodeElement, zoom, node.origin || nodeOrigin),
            },
          },
        };
      }
    }

    return node;
  });

  return nextNodes;
}

export function panBy({
  delta,
  panZoom,
  transform,
  translateExtent,
  width,
  height,
}: {
  delta: XYPosition;
  panZoom: PanZoomInstance | null;
  transform: Transform;
  translateExtent: CoordinateExtent;
  width: number;
  height: number;
}) {
  if (!panZoom || (!delta.x && !delta.y)) {
    return false;
  }

  const nextViewport = panZoom.setViewportConstrained(
    {
      x: transform[0] + delta.x,
      y: transform[1] + delta.y,
      zoom: transform[2],
    },
    [
      [0, 0],
      [width, height],
    ],
    translateExtent
  );

  const transformChanged =
    !!nextViewport &&
    (nextViewport.x !== transform[0] || nextViewport.y !== transform[1] || nextViewport.k !== transform[2]);

  return transformChanged;
}
