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
  evaluateAbsolutePosition,
  type HandleType,
  type HandleConnection,
  getNodesBounds
} from '@xyflow/system';

import { useStore } from '$lib/store';
import type { Edge, FitViewOptions, InternalNode, Node } from '$lib/types';
import { isEdge, isNode } from '$lib/utils';
import { derivedWarning } from './derivedWarning.svelte';

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
  getNodes: (ids?: string[]) => Node[];
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
  getEdges: (ids?: string[]) => Edge[];
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
  // updateNode: (
  //   id: string,
  //   nodeUpdate: Partial<Node> | ((node: Node) => Partial<Node>),
  //   options?: { replace: boolean }
  // ) => void;
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
  /**
   * Updates an edge.
   *
   * @param id - id of the edge to update
   * @param edgeUpdate - the edge update as an object or a function that receives the current edge and returns the edge update
   * @param options.replace - if true, the edge is replaced with the edge update, otherwise the changes get merged
   *
   * @example
   * updateNode('node-1', (node) => ({ position: { x: node.position.x + 10, y: node.position.y } }));
   */
  updateEdge: (
    id: string,
    edgeUpdate: Partial<Edge> | ((edge: Edge) => Partial<Edge>),
    options?: { replace: boolean }
  ) => void;
  toObject: () => { nodes: Node[]; edges: Edge[]; viewport: Viewport };
  /**
   * Returns the bounds of the given nodes or node ids.
   *
   * @param nodes - the nodes or node ids to calculate the bounds for
   *
   * @returns the bounds of the given nodes
   */
  getNodesBounds: (nodes: (Node | InternalNode | string)[]) => Rect;
  /** Gets all connections for a given handle belonging to a specific node.
   *
   * @param type - handle type 'source' or 'target'
   * @param id - the handle id (this is only needed if you have multiple handles of the same type, meaning you have to provide a unique id for each handle)
   * @param nodeId - the node id the handle belongs to
   * @returns an array with handle connections
   */
  getHandleConnections: ({
    type,
    id,
    nodeId
  }: {
    type: HandleType;
    nodeId: string;
    id?: string | null;
  }) => HandleConnection[];
} {
  if (process.env.NODE_ENV === 'development') {
    derivedWarning('useSvelteFlow');
  }

  const store = useStore();

  const getNodeRect = (node: Node | { id: Node['id'] }): Rect | null => {
    const nodeToUse = isNode(node) ? node : store.nodeLookup.get(node.id)!;
    const position = nodeToUse.parentId
      ? evaluateAbsolutePosition(
          nodeToUse.position,
          nodeToUse.measured,
          nodeToUse.parentId,
          store.nodeLookup,
          store.nodeOrigin
        )
      : nodeToUse.position;

    const nodeWithPosition = {
      ...nodeToUse,
      position,
      width: nodeToUse.measured?.width ?? nodeToUse.width,
      height: nodeToUse.measured?.height ?? nodeToUse.height
    };

    return nodeToRect(nodeWithPosition);
  };

  function updateNode(
    id: string,
    nodeUpdate: Partial<Node> | ((node: Node) => Partial<Node>),
    options: { replace: boolean } = { replace: false }
  ) {
    store.nodes = store.nodes.map((node) => {
      if (node.id === id) {
        const nextNode = typeof nodeUpdate === 'function' ? nodeUpdate(node as Node) : nodeUpdate;
        return options?.replace && isNode(nextNode) ? nextNode : { ...node, ...nextNode };
      }

      return node;
    });
  }

  function updateEdge(
    id: string,
    edgeUpdate: Partial<Edge> | ((edge: Edge) => Partial<Edge>),
    options: { replace: boolean } = { replace: false }
  ) {
    store.edges = store.edges.map((edge) => {
      if (edge.id === id) {
        const nextEdge = typeof edgeUpdate === 'function' ? edgeUpdate(edge) : edgeUpdate;
        return options.replace && isEdge(nextEdge) ? nextEdge : { ...edge, ...nextEdge };
      }

      return edge;
    });
  }

  const getInternalNode = (id: string) => store.nodeLookup.get(id);

  return {
    zoomIn: store.zoomIn,
    zoomOut: store.zoomOut,
    getInternalNode,
    getNode: (id) => getInternalNode(id)?.internals.userNode,
    getNodes: (ids) => (ids === undefined ? store.nodes : getElements(store.nodeLookup, ids)),
    getEdge: (id) => store.edgeLookup.get(id),
    getEdges: (ids) => (ids === undefined ? store.edges : getElements(store.edgeLookup, ids)),
    setZoom: (zoomLevel, options) => {
      const panZoom = store.panZoom;
      return panZoom
        ? panZoom.scaleTo(zoomLevel, { duration: options?.duration })
        : Promise.resolve(false);
    },
    getZoom: () => store.viewport.zoom,
    setViewport: async (nextViewport, options) => {
      const currentViewport = store.viewport;

      if (!store.panZoom) {
        return Promise.resolve(false);
      }

      await store.panZoom.setViewport(
        {
          x: nextViewport.x ?? currentViewport.x,
          y: nextViewport.y ?? currentViewport.y,
          zoom: nextViewport.zoom ?? currentViewport.zoom
        },
        { duration: options?.duration }
      );

      return Promise.resolve(true);
    },
    getViewport: () => $state.snapshot(store.viewport),
    setCenter: async (x, y, options) => {
      const nextZoom = typeof options?.zoom !== 'undefined' ? options.zoom : store.maxZoom;
      const currentPanZoom = store.panZoom;

      if (!currentPanZoom) {
        return Promise.resolve(false);
      }

      await currentPanZoom.setViewport(
        {
          x: store.width / 2 - x * nextZoom,
          y: store.height / 2 - y * nextZoom,
          zoom: nextZoom
        },
        { duration: options?.duration }
      );

      return Promise.resolve(true);
    },
    fitView: store.fitView,
    fitBounds: async (bounds: Rect, options?: FitBoundsOptions) => {
      if (!store.panZoom) {
        return Promise.resolve(false);
      }

      const viewport = getViewportForBounds(
        bounds,
        store.width,
        store.height,
        store.minZoom,
        store.maxZoom,
        options?.padding ?? 0.1
      );

      await store.panZoom.setViewport(viewport, { duration: options?.duration });

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

      return (nodesToIntersect || store.nodes).filter((n) => {
        const internalNode = store.nodeLookup.get(n.id);
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
        nodes: store.nodes,
        edges: store.edges,
        onBeforeDelete: store.onbeforedelete
      });

      if (matchingNodes) {
        store.nodes = store.nodes.filter((node) => !matchingNodes.some(({ id }) => id === node.id));
      }

      if (matchingEdges) {
        store.edges = store.edges.filter((edge) => !matchingEdges.some(({ id }) => id === edge.id));
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
      if (!store.domNode) {
        return position;
      }

      const _snapGrid = options.snapToGrid ? store.snapGrid : false;
      const { x, y, zoom } = store.viewport;
      const { x: domX, y: domY } = store.domNode.getBoundingClientRect();
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
      if (!store.domNode) {
        return position;
      }

      const { x, y, zoom } = store.viewport;
      const { x: domX, y: domY } = store.domNode.getBoundingClientRect();
      const rendererPosition = rendererPointToPoint(position, [x, y, zoom]);

      return {
        x: rendererPosition.x + domX,
        y: rendererPosition.y + domY
      };
    },

    toObject: () => {
      return structuredClone({
        nodes: [...store.nodes],
        edges: [...store.edges],
        viewport: { ...store.viewport }
      });
    },
    updateNode,
    updateNodeData: (id, dataUpdate, options) => {
      const node = store.nodeLookup.get(id)?.internals.userNode;

      if (!node) {
        return;
      }

      const nextData = typeof dataUpdate === 'function' ? dataUpdate(node) : dataUpdate;

      updateNode(id, { data: options?.replace ? nextData : { ...node.data, ...nextData } });
    },
    updateEdge,
    getNodesBounds: (nodes) => {
      return getNodesBounds(nodes, { nodeLookup: store.nodeLookup, nodeOrigin: store.nodeOrigin });
    },
    getHandleConnections: ({ type, id, nodeId }) =>
      Array.from(store.connectionLookup.get(`${nodeId}-${type}-${id ?? null}`)?.values() ?? [])
  };
}

function getElements(lookup: Map<string, InternalNode>, ids: string[]): Node[];
function getElements(lookup: Map<string, Edge>, ids: string[]): Edge[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getElements(lookup: Map<string, any>, ids: string[]): any[] {
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
