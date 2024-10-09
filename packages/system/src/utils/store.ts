import { infiniteExtent } from '..';
import {
  NodeBase,
  CoordinateExtent,
  InternalNodeUpdate,
  NodeOrigin,
  PanZoomInstance,
  Transform,
  XYPosition,
  ConnectionLookup,
  EdgeBase,
  EdgeLookup,
  InternalNodeBase,
  NodeLookup,
  Rect,
  NodeDimensionChange,
  NodePositionChange,
  ParentLookup,
} from '../types';
import { getDimensions, getHandleBounds } from './dom';
import {
  clampPosition,
  clampPositionToParent,
  getBoundsOfRects,
  getNodeDimensions,
  isCoordinateExtent,
  isNumeric,
  nodeToRect,
} from './general';
import { getNodePositionWithOrigin } from './graph';
import { ParentExpandChild } from './types';

const defaultOptions = {
  nodeOrigin: [0, 0] as NodeOrigin,
  nodeExtent: infiniteExtent,
  elevateNodesOnSelect: true,
  defaults: {},
};

const adoptUserNodesDefaultOptions = {
  ...defaultOptions,
  checkEquality: true,
};

function mergeObjects<T extends Record<string, unknown>>(base: T, incoming?: Partial<T>): T {
  const result = { ...base };
  for (const key in incoming) {
    if (incoming[key] !== undefined) {
      // typecast is safe here, because we check for undefined
      result[key] = (incoming as T)[key]!;
    }
  }

  return result;
}

export function updateAbsolutePositions<NodeType extends NodeBase>(
  nodeLookup: NodeLookup<InternalNodeBase<NodeType>>,
  parentLookup: ParentLookup<InternalNodeBase<NodeType>>,
  options?: UpdateNodesOptions<NodeType>
) {
  const _options = mergeObjects(defaultOptions, options);
  for (const node of nodeLookup.values()) {
    if (node.parentId) {
      updateChildNode(node, nodeLookup, parentLookup, _options);
    } else {
      const positionWithOrigin = getNodePositionWithOrigin(node, _options.nodeOrigin);
      const extent = isCoordinateExtent(node.extent) ? node.extent : _options.nodeExtent;
      const clampedPosition = clampPosition(positionWithOrigin, extent, getNodeDimensions(node));
      node.internals.positionAbsolute = clampedPosition;
    }
  }
}

type UpdateNodesOptions<NodeType extends NodeBase> = {
  nodeOrigin?: NodeOrigin;
  nodeExtent?: CoordinateExtent;
  elevateNodesOnSelect?: boolean;
  defaults?: Partial<NodeType>;
  checkEquality?: boolean;
};

export function adoptUserNodes<NodeType extends NodeBase>(
  nodes: NodeType[],
  nodeLookup: NodeLookup<InternalNodeBase<NodeType>>,
  parentLookup: ParentLookup<InternalNodeBase<NodeType>>,
  options?: UpdateNodesOptions<NodeType>
) {
  const _options = mergeObjects(adoptUserNodesDefaultOptions, options);
  const tmpLookup = new Map(nodeLookup);
  const selectedNodeZ: number = _options?.elevateNodesOnSelect ? 1000 : 0;

  nodeLookup.clear();
  parentLookup.clear();

  for (const userNode of nodes) {
    let internalNode = tmpLookup.get(userNode.id);

    if (_options.checkEquality && userNode === internalNode?.internals.userNode) {
      nodeLookup.set(userNode.id, internalNode);
    } else {
      const positionWithOrigin = getNodePositionWithOrigin(userNode, _options.nodeOrigin);
      const extent = isCoordinateExtent(userNode.extent) ? userNode.extent : _options.nodeExtent;
      const clampedPosition = clampPosition(positionWithOrigin, extent, getNodeDimensions(userNode));

      internalNode = {
        ..._options.defaults,
        ...userNode,
        measured: {
          width: userNode.measured?.width,
          height: userNode.measured?.height,
        },
        internals: {
          positionAbsolute: clampedPosition,
          // if user re-initializes the node or removes `measured` for whatever reason, we reset the handleBounds so that the node gets re-measured
          handleBounds: !userNode.measured ? undefined : internalNode?.internals.handleBounds,
          z: calculateZ(userNode, selectedNodeZ),
          userNode,
        },
      };

      nodeLookup.set(userNode.id, internalNode);
    }

    if (userNode.parentId) {
      updateChildNode(internalNode, nodeLookup, parentLookup, options);
    }
  }
}

function updateParentLookup<NodeType extends NodeBase>(
  node: InternalNodeBase<NodeType>,
  parentLookup: ParentLookup<InternalNodeBase<NodeType>>
) {
  if (!node.parentId) {
    return;
  }

  const childNodes = parentLookup.get(node.parentId);

  if (childNodes) {
    childNodes.set(node.id, node);
  } else {
    parentLookup.set(node.parentId, new Map([[node.id, node]]));
  }
}

/**
 * Updates positionAbsolute and zIndex of a child node and the parentLookup.
 */
function updateChildNode<NodeType extends NodeBase>(
  node: InternalNodeBase<NodeType>,
  nodeLookup: NodeLookup<InternalNodeBase<NodeType>>,
  parentLookup: ParentLookup<InternalNodeBase<NodeType>>,
  options?: UpdateNodesOptions<NodeType>
) {
  const { elevateNodesOnSelect, nodeOrigin, nodeExtent } = mergeObjects(defaultOptions, options);
  const parentId = node.parentId!;
  const parentNode = nodeLookup.get(parentId);

  if (!parentNode) {
    console.warn(
      `Parent node ${parentId} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`
    );
    return;
  }

  updateParentLookup(node, parentLookup);

  const selectedNodeZ = elevateNodesOnSelect ? 1000 : 0;
  const { x, y, z } = calculateChildXYZ(node, parentNode, nodeOrigin, nodeExtent, selectedNodeZ);
  const { positionAbsolute } = node.internals;
  const positionChanged = x !== positionAbsolute.x || y !== positionAbsolute.y;

  if (positionChanged || z !== node.internals.z) {
    node.internals = {
      ...node.internals,
      positionAbsolute: positionChanged ? { x, y } : positionAbsolute,
      z,
    };
  }
}

function calculateZ(node: NodeBase, selectedNodeZ: number) {
  return (isNumeric(node.zIndex) ? node.zIndex : 0) + (node.selected ? selectedNodeZ : 0);
}

function calculateChildXYZ<NodeType extends NodeBase>(
  childNode: InternalNodeBase<NodeType>,
  parentNode: InternalNodeBase<NodeType>,
  nodeOrigin: NodeOrigin,
  nodeExtent: CoordinateExtent,
  selectedNodeZ: number
) {
  const { x: parentX, y: parentY } = parentNode.internals.positionAbsolute;
  const childDimensions = getNodeDimensions(childNode);
  const positionWithOrigin = getNodePositionWithOrigin(childNode, nodeOrigin);
  const clampedPosition = isCoordinateExtent(childNode.extent)
    ? clampPosition(positionWithOrigin, childNode.extent, childDimensions)
    : positionWithOrigin;

  let absolutePosition = clampPosition(
    { x: parentX + clampedPosition.x, y: parentY + clampedPosition.y },
    nodeExtent,
    childDimensions
  );

  if (childNode.extent === 'parent') {
    absolutePosition = clampPositionToParent(absolutePosition, childDimensions, parentNode);
  }

  const childZ = calculateZ(childNode, selectedNodeZ);
  const parentZ = parentNode.internals.z ?? 0;

  return {
    x: absolutePosition.x,
    y: absolutePosition.y,
    z: parentZ > childZ ? parentZ : childZ,
  };
}

export function handleExpandParent(
  children: ParentExpandChild[],
  nodeLookup: NodeLookup,
  parentLookup: ParentLookup,
  nodeOrigin: NodeOrigin = [0, 0]
): (NodeDimensionChange | NodePositionChange)[] {
  const changes: (NodeDimensionChange | NodePositionChange)[] = [];
  const parentExpansions = new Map<string, { expandedRect: Rect; parent: InternalNodeBase }>();

  // determine the expanded rectangle the child nodes would take for each parent
  for (const child of children) {
    const parent = nodeLookup.get(child.parentId);
    if (!parent) {
      continue;
    }

    const parentRect = parentExpansions.get(child.parentId)?.expandedRect ?? nodeToRect(parent);
    const expandedRect = getBoundsOfRects(parentRect, child.rect);

    parentExpansions.set(child.parentId, { expandedRect, parent });
  }

  if (parentExpansions.size > 0) {
    parentExpansions.forEach(({ expandedRect, parent }, parentId) => {
      // determine the position & dimensions of the parent
      const positionAbsolute = parent.internals.positionAbsolute;
      const dimensions = getNodeDimensions(parent);
      const origin = parent.origin ?? nodeOrigin;

      // determine how much the parent expands in width and position
      const xChange =
        expandedRect.x < positionAbsolute.x ? Math.round(Math.abs(positionAbsolute.x - expandedRect.x)) : 0;
      const yChange =
        expandedRect.y < positionAbsolute.y ? Math.round(Math.abs(positionAbsolute.y - expandedRect.y)) : 0;

      const newWidth = Math.max(dimensions.width, Math.round(expandedRect.width));
      const newHeight = Math.max(dimensions.height, Math.round(expandedRect.height));

      const widthChange = (newWidth - dimensions.width) * origin[0];
      const heightChange = (newHeight - dimensions.height) * origin[1];

      // We need to correct the position of the parent node if the origin is not [0,0]
      if (xChange > 0 || yChange > 0 || widthChange || heightChange) {
        changes.push({
          id: parentId,
          type: 'position',
          position: {
            x: parent.position.x - xChange + widthChange,
            y: parent.position.y - yChange + heightChange,
          },
        });

        // We move all child nodes in the oppsite direction
        // so the x,y changes of the parent do not move the children
        parentLookup.get(parentId)?.forEach((childNode) => {
          if (!children.some((child) => child.id === childNode.id)) {
            changes.push({
              id: childNode.id,
              type: 'position',
              position: {
                x: childNode.position.x + xChange,
                y: childNode.position.y + yChange,
              },
            });
          }
        });
      }

      // We need to correct the dimensions of the parent node if the origin is not [0,0]
      if (dimensions.width < expandedRect.width || dimensions.height < expandedRect.height || xChange || yChange) {
        changes.push({
          id: parentId,
          type: 'dimensions',
          setAttributes: true,
          dimensions: {
            width: newWidth + (xChange ? origin[0] * xChange - widthChange : 0),
            height: newHeight + (yChange ? origin[1] * yChange - heightChange : 0),
          },
        });
      }
    });
  }

  return changes;
}

export function updateNodeInternals<NodeType extends InternalNodeBase>(
  updates: Map<string, InternalNodeUpdate>,
  nodeLookup: NodeLookup<NodeType>,
  parentLookup: ParentLookup<NodeType>,
  domNode: HTMLElement | null,
  nodeOrigin?: NodeOrigin,
  nodeExtent?: CoordinateExtent
): { changes: (NodeDimensionChange | NodePositionChange)[]; updatedInternals: boolean } {
  const viewportNode = domNode?.querySelector('.xyflow__viewport');
  let updatedInternals = false;

  if (!viewportNode) {
    return { changes: [], updatedInternals };
  }

  const changes: (NodeDimensionChange | NodePositionChange)[] = [];
  const style = window.getComputedStyle(viewportNode);
  const { m22: zoom } = new window.DOMMatrixReadOnly(style.transform);
  // in this array we collect nodes, that might trigger changes (like expanding parent)
  const parentExpandChildren: ParentExpandChild[] = [];

  for (const update of updates.values()) {
    const node = nodeLookup.get(update.id);
    if (!node) {
      continue;
    }

    if (node.hidden) {
      node.internals = {
        ...node.internals,
        handleBounds: undefined,
      };
      updatedInternals = true;
    } else {
      const dimensions = getDimensions(update.nodeElement);
      const dimensionChanged = node.measured.width !== dimensions.width || node.measured.height !== dimensions.height;
      const doUpdate = !!(
        dimensions.width &&
        dimensions.height &&
        (dimensionChanged || !node.internals.handleBounds || update.force)
      );

      if (doUpdate) {
        const nodeBounds = update.nodeElement.getBoundingClientRect();
        const extent = isCoordinateExtent(node.extent) ? node.extent : nodeExtent;
        let { positionAbsolute } = node.internals;

        if (node.parentId && node.extent === 'parent') {
          positionAbsolute = clampPositionToParent(positionAbsolute, dimensions, nodeLookup.get(node.parentId)!);
        } else if (extent) {
          positionAbsolute = clampPosition(positionAbsolute, extent, dimensions);
        }

        node.measured = dimensions;
        node.internals = {
          ...node.internals,
          positionAbsolute,
          handleBounds: {
            source: getHandleBounds('source', update.nodeElement, nodeBounds, zoom, node.id),
            target: getHandleBounds('target', update.nodeElement, nodeBounds, zoom, node.id),
          },
        };
        if (node.parentId) {
          updateChildNode(node, nodeLookup, parentLookup, { nodeOrigin });
        }

        updatedInternals = true;

        if (dimensionChanged) {
          changes.push({
            id: node.id,
            type: 'dimensions',
            dimensions,
          });

          if (node.expandParent && node.parentId) {
            parentExpandChildren.push({
              id: node.id,
              parentId: node.parentId,
              rect: nodeToRect(node, nodeOrigin),
            });
          }
        }
      }
    }
  }

  if (parentExpandChildren.length > 0) {
    const parentExpandChanges = handleExpandParent(parentExpandChildren, nodeLookup, parentLookup, nodeOrigin);
    changes.push(...parentExpandChanges);
  }

  return { changes, updatedInternals };
}

export async function panBy({
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
}): Promise<boolean> {
  if (!panZoom || (!delta.x && !delta.y)) {
    return Promise.resolve(false);
  }

  const nextViewport = await panZoom.setViewportConstrained(
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

  return Promise.resolve(transformChanged);
}

export function updateConnectionLookup(connectionLookup: ConnectionLookup, edgeLookup: EdgeLookup, edges: EdgeBase[]) {
  connectionLookup.clear();
  edgeLookup.clear();

  for (const edge of edges) {
    const { source, target, sourceHandle = null, targetHandle = null } = edge;

    const sourceKey = `${source}-source-${sourceHandle}`;
    const targetKey = `${target}-target-${targetHandle}`;

    const prevSource = connectionLookup.get(sourceKey) || new Map();
    const prevTarget = connectionLookup.get(targetKey) || new Map();
    const connection = { edgeId: edge.id, source, target, sourceHandle, targetHandle };

    edgeLookup.set(edge.id, edge);
    connectionLookup.set(sourceKey, prevSource.set(`${target}-${targetHandle}`, connection));
    connectionLookup.set(targetKey, prevTarget.set(`${source}-${sourceHandle}`, connection));
  }
}
