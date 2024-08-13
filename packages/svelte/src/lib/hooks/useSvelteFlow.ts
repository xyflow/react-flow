import { get, type Writable } from 'svelte/store';
import {
  getOverlappingArea,
  isRectObject,
  nodeToRect,
  pointToRendererPoint,
  type FitBoundsOptions,
  type SetCenterOptions,
  type Viewport,
  type ViewportHelperFunctionOptions,
  type XYPosition,
  type ZoomInOut,
  type Rect,
  getViewportForBounds,
  getElementsToRemove,
  rendererPointToPoint,
  nodeHasDimensions
} from '@xyflow/system';

import { useStore } from '$lib/store';
import type { Edge, FitViewOptions, InternalNode, Node } from '$lib/types';
import { isNode } from '$lib/utils';

/**
 * Hook for accessing the ReactFlow instance.
 *
 * @public
 *
 * @returns helper functions
 */
export function useSvelteFlow(): {
  /**
   * Zooms viewport in by 1.2.
   *
   * @param options.duration - optional duration. If set, a transition will be applied
   */
  zoomIn: ZoomInOut;
  /**
   * Zooms viewport out by 1 / 1.2.
   *
   * @param options.duration - optional duration. If set, a transition will be applied
   */
  zoomOut: ZoomInOut;
  /**
   * Returns an internal node by id.
   *
   * @param id - the node id
   * @returns the node or undefined if no node was found
   */
  getInternalNode: (id: string) => InternalNode | undefined;
  /**
   * Returns a node by id.
   *
   * @param id - the node id
   * @returns the node or undefined if no node was found
   */
  getNode: (id: string) => Node | undefined;
  /**
   * Returns nodes.
   *
   * @returns nodes array
   */
  getNodes: (ids?: readonly string[]) => readonly Node[];
  /**
   * Returns an edge by id.
   *
   * @param id - the edge id
   * @returns the edge or undefined if no edge was found
   */
  getEdge: (id: string) => Edge | undefined;
  /**
   * Returns edges.
   *
   * @returns edges array
   */
  getEdges: (ids?: readonly string[]) => readonly Edge[];
  /**
   * Sets the current zoom level.
   *
   * @param zoomLevel - the zoom level to set
   * @param options.duration - optional duration. If set, a transition will be applied
   */
  setZoom: (zoomLevel: number, options?: ViewportHelperFunctionOptions) => Promise<boolean>;
  /**
   * Returns the current zoom level.
   *
   * @returns current zoom as a number
   */
  getZoom: () => number;
  /**
   * Sets the center of the view to the given position.
   *
   * @param x - x position
   * @param y - y position
   * @param options.zoom - optional zoom
   */
  setCenter: (x: number, y: number, options?: SetCenterOptions) => Promise<boolean>;
  /**
   * Sets the current viewport.
   *
   * @param viewport - the viewport to set
   * @param options.duration - optional duration. If set, a transition will be applied
   */
  setViewport: (viewport: Viewport, options?: ViewportHelperFunctionOptions) => Promise<boolean>;
  /**
   * Returns the current viewport.
   *
   * @returns Viewport
   */
  getViewport: () => Viewport;
  /**
   * Fits the view.
   *
   * @param options.padding - optional padding
   * @param options.includeHiddenNodes - optional includeHiddenNodes
   * @param options.minZoom - optional minZoom
   * @param options.maxZoom - optional maxZoom
   * @param options.duration - optional duration. If set, a transition will be applied
   * @param options.nodes - optional nodes to fit the view to
   */
  fitView: (options?: FitViewOptions) => Promise<boolean>;
  /**
   * Returns all nodes that intersect with the given node or rect.
   *
   * @param node - the node or rect to check for intersections
   * @param partially - if true, the node is considered to be intersecting if it partially overlaps with the passed node or rect
   * @param nodes - optional nodes array to check for intersections
   *
   * @returns an array of intersecting nodes
   */
  getIntersectingNodes: (
    nodeOrRect: Node | { id: Node['id'] } | Rect,
    partially?: boolean,
    nodesToIntersect?: Node[]
  ) => Node[];
  /**
   * Checks if the given node or rect intersects with the passed rect.
   *
   * @param node - the node or rect to check for intersections
   * @param area - the rect to check for intersections
   * @param partially - if true, the node is considered to be intersecting if it partially overlaps with the passed react
   *
   * @returns true if the node or rect intersects with the given area
   */
  isNodeIntersecting: (
    nodeOrRect: Node | { id: Node['id'] } | Rect,
    area: Rect,
    partially?: boolean
  ) => boolean;
  /**
   * Fits the view to the given bounds .
   *
   * @param bounds - the bounds ({ x: number, y: number, width: number, height: number }) to fit the view to
   * @param options.padding - optional padding
   */
  fitBounds: (bounds: Rect, options?: FitBoundsOptions) => Promise<boolean>;
  /**
   * Deletes nodes and edges.
   *
   * @param params.nodes - optional nodes array to delete
   * @param params.edges - optional edges array to delete
   *
   * @returns a promise that resolves with the deleted nodes and edges
   */
  deleteElements: ({
    nodes,
    edges
  }: {
    nodes?: (Node | { id: Node['id'] })[];
    edges?: (Edge | { id: Edge['id'] })[];
  }) => Promise<{ deletedNodes: Node[]; deletedEdges: Edge[] }>;
  /**
   * Converts a screen / client position to a flow position.
   *
   * @param clientPosition - the screen / client position. When you are working with events you can use event.clientX and event.clientY
   * @param options.snapToGrid - if true, the converted position will be snapped to the grid
   * @returns position as { x: number, y: number }
   *
   * @example
   * const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY })
   */
  screenToFlowPosition: (
    clientPosition: XYPosition,
    options?: { snapToGrid: boolean }
  ) => XYPosition;
  /**
   * Converts a flow position to a screen / client position.
   *
   * @param flowPosition - the screen / client position. When you are working with events you can use event.clientX and event.clientY
   * @returns position as { x: number, y: number }
   *
   * @example
   * const clientPosition = flowToScreenPosition({ x: node.position.x, y: node.position.y })
   */
  flowToScreenPosition: (flowPosition: XYPosition) => XYPosition;
  viewport: Writable<Viewport>;
  /**
   * Updates a node.
   *
   * @param id - id of the node to update
   * @param nodeUpdate - the node update as an object or a function that receives the current node and returns the node update
   * @param options.replace - if true, the node is replaced with the node update, otherwise the changes get merged
   *
   * @example
   * updateNode('node-1', (node) => ({ position: { x: node.position.x + 10, y: node.position.y } }));
   */
  updateNode: (
    id: string,
    nodeUpdate: Partial<Node> | ((node: Node) => Partial<Node>),
    options?: { replace: boolean }
  ) => void;
  /**
   * Updates the data attribute of a node.
   *
   * @param id - id of the node to update
   * @param dataUpdate - the data update as an object or a function that receives the current data and returns the data update
   * @param options.replace - if true, the data is replaced with the data update, otherwise the changes get merged
   *
   * @example
   * updateNodeData('node-1', { label: 'A new label' });
   */
  updateNodeData: (
    id: string,
    dataUpdate: object | ((node: Node) => object),
    options?: { replace: boolean }
  ) => void;
  /**
   * Returns the nodes, edges and the viewport as a JSON object.
   *
   * @returns the nodes, edges and the viewport as a JSON object
   */
  toObject: () => { nodes: Node[]; edges: Edge[]; viewport: Viewport };
} {
  const {
    zoomIn,
    zoomOut,
    fitView,
    onbeforedelete,
    snapGrid,
    viewport,
    width,
    height,
    minZoom,
    maxZoom,
    panZoom,
    nodes,
    edges,
    domNode,
    nodeLookup,
    edgeLookup
  } = useStore();

  const getNodeRect = (nodeOrRect: Node | { id: Node['id'] }): Rect | null => {
    const node =
      isNode(nodeOrRect) && nodeHasDimensions(nodeOrRect)
        ? nodeOrRect
        : get(nodeLookup).get(nodeOrRect.id);
    return node ? nodeToRect(node) : null;
  };

  const updateNode = (
    id: string,
    nodeUpdate: Partial<Node> | ((node: Node) => Partial<Node>),
    options: { replace: boolean } = { replace: false }
  ) => {
    const node = get(nodeLookup).get(id)?.internals.userNode;

    if (!node) {
      return;
    }

    const nextNode = typeof nodeUpdate === 'function' ? nodeUpdate(node as Node) : nodeUpdate;

    if (options.replace) {
      nodes.update((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return isNode(nextNode) ? nextNode : { ...node, ...nextNode };
          }

          return node;
        })
      );
    } else {
      Object.assign(node, nextNode);
      nodes.update((nds) => nds);
    }
  };

  const getInternalNode = (id: string) => get(nodeLookup).get(id);

  return {
    zoomIn,
    zoomOut,
    getInternalNode,
    getNode: (id) => getInternalNode(id)?.internals.userNode,
    getNodes: (ids) => (ids === undefined ? get(nodes) : getElements(get(nodeLookup), ids)),
    getEdge: (id) => get(edgeLookup).get(id),
    getEdges: (ids) => (ids === undefined ? get(edges) : getElements(get(edgeLookup), ids)),
    setZoom: (zoomLevel, options) => {
      const currentPanZoom = get(panZoom);
      return currentPanZoom
        ? currentPanZoom.scaleTo(zoomLevel, { duration: options?.duration })
        : Promise.resolve(false);
    },
    getZoom: () => get(viewport).zoom,
    setViewport: async (nextViewport, options) => {
      const currentViewport = get(viewport);
      const currentPanZoom = get(panZoom);

      if (!currentPanZoom) {
        return Promise.resolve(false);
      }

      await currentPanZoom.setViewport(
        {
          x: nextViewport.x ?? currentViewport.x,
          y: nextViewport.y ?? currentViewport.y,
          zoom: nextViewport.zoom ?? currentViewport.zoom
        },
        { duration: options?.duration }
      );

      return Promise.resolve(true);
    },
    getViewport: () => get(viewport),
    setCenter: async (x, y, options) => {
      const nextZoom = typeof options?.zoom !== 'undefined' ? options.zoom : get(maxZoom);
      const currentPanZoom = get(panZoom);

      if (!currentPanZoom) {
        return Promise.resolve(false);
      }

      await currentPanZoom.setViewport(
        {
          x: get(width) / 2 - x * nextZoom,
          y: get(height) / 2 - y * nextZoom,
          zoom: nextZoom
        },
        { duration: options?.duration }
      );

      return Promise.resolve(true);
    },
    fitView,
    fitBounds: async (bounds: Rect, options?: FitBoundsOptions) => {
      const currentPanZoom = get(panZoom);

      if (!currentPanZoom) {
        return Promise.resolve(false);
      }

      const viewport = getViewportForBounds(
        bounds,
        get(width),
        get(height),
        get(minZoom),
        get(maxZoom),
        options?.padding ?? 0.1
      );

      await currentPanZoom.setViewport(viewport, { duration: options?.duration });

      return Promise.resolve(true);
    },
    getIntersectingNodes: (
      nodeOrRect: Node | { id: Node['id'] } | Rect,
      partially = true,
      nodesToIntersect?: Node[]
    ) => {
      const isRect = isRectObject(nodeOrRect);
      const nodeRect = isRect ? nodeOrRect : getNodeRect(nodeOrRect);

      if (!nodeRect) {
        return [];
      }

      return (nodesToIntersect || get(nodes)).filter((n) => {
        const internalNode = get(nodeLookup).get(n.id);
        if (!internalNode || (!isRect && n.id === nodeOrRect.id)) {
          return false;
        }

        const currNodeRect = nodeToRect(internalNode);
        const overlappingArea = getOverlappingArea(currNodeRect, nodeRect);
        const partiallyVisible = partially && overlappingArea > 0;

        return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
      });
    },
    isNodeIntersecting: (
      nodeOrRect: Node | { id: Node['id'] } | Rect,
      area: Rect,
      partially = true
    ) => {
      const isRect = isRectObject(nodeOrRect);
      const nodeRect = isRect ? nodeOrRect : getNodeRect(nodeOrRect);

      if (!nodeRect) {
        return false;
      }

      const overlappingArea = getOverlappingArea(nodeRect, area);
      const partiallyVisible = partially && overlappingArea > 0;

      return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
    },
    deleteElements: async ({ nodes: nodesToRemove = [], edges: edgesToRemove = [] }) => {
      const { nodes: matchingNodes, edges: matchingEdges } = await getElementsToRemove({
        nodesToRemove,
        edgesToRemove,
        nodes: get(nodes),
        edges: get(edges),
        onBeforeDelete: get(onbeforedelete)
      });

      if (matchingNodes) {
        nodes.update((nds) =>
          nds.filter((node) => !matchingNodes.some(({ id }) => id === node.id))
        );
      }

      if (matchingEdges) {
        edges.update((eds) =>
          eds.filter((edge) => !matchingEdges.some(({ id }) => id === edge.id))
        );
      }

      return {
        deletedNodes: matchingNodes,
        deletedEdges: matchingEdges
      };
    },
    screenToFlowPosition: (
      position: XYPosition,
      options: { snapToGrid: boolean } = { snapToGrid: true }
    ) => {
      const _domNode = get(domNode);

      if (!_domNode) {
        return position;
      }

      const _snapGrid = options.snapToGrid ? get(snapGrid) : false;
      const { x, y, zoom } = get(viewport);
      const { x: domX, y: domY } = _domNode.getBoundingClientRect();
      const correctedPosition = {
        x: position.x - domX,
        y: position.y - domY
      };

      return pointToRendererPoint(
        correctedPosition,
        [x, y, zoom],
        _snapGrid !== null,
        _snapGrid || [1, 1]
      );
    },
    /**
     *
     * @param position
     * @returns
     */
    flowToScreenPosition: (position: XYPosition) => {
      const _domNode = get(domNode);

      if (!_domNode) {
        return position;
      }

      const { x, y, zoom } = get(viewport);
      const { x: domX, y: domY } = _domNode.getBoundingClientRect();
      const rendererPosition = rendererPointToPoint(position, [x, y, zoom]);

      return {
        x: rendererPosition.x + domX,
        y: rendererPosition.y + domY
      };
    },

    toObject: () => {
      return {
        nodes: get(nodes).map((node) => ({
          ...node,
          // we want to make sure that changes to the nodes object that gets returned by toObject
          // do not affect the nodes object
          position: { ...node.position },
          data: { ...node.data }
        })),
        edges: get(edges).map((edge) => ({ ...edge })),
        viewport: { ...get(viewport) }
      };
    },
    updateNode,
    updateNodeData: (id, dataUpdate, options) => {
      const node = get(nodeLookup).get(id)?.internals.userNode;

      if (!node) {
        return;
      }

      const nextData = typeof dataUpdate === 'function' ? dataUpdate(node) : dataUpdate;

      node.data = options?.replace ? nextData : { ...node.data, ...nextData };

      nodes.update((nds) => nds);
    },
    viewport
  };
}
function getElements(lookup: Map<string, InternalNode>, ids: readonly string[]): Node[];
function getElements(lookup: Map<string, Edge>, ids: readonly string[]): Edge[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getElements(lookup: Map<string, any>, ids: readonly string[]): any[] {
  const result = [];

  for (const id of ids) {
    const item = lookup.get(id);

    if (item) {
      const element = 'internals' in item ? item.internals?.userNode : item;
      result.push(element);
    }
  }

  return result;
}
