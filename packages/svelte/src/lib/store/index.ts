import { getContext, setContext } from 'svelte';
import { derived, get, writable } from 'svelte/store';
import {
  createMarkerIds,
  fitView as fitViewSystem,
  getElementsToRemove,
  panBy as panBySystem,
  updateNodeInternals as updateNodeInternalsSystem,
  addEdge as addEdgeUtil,
  initialConnection,
  pointToRendererPoint,
  type UpdateNodePositions,
  type InternalNodeUpdate,
  type ViewportHelperFunctionOptions,
  type Connection,
  type XYPosition,
  type CoordinateExtent,
  type UpdateConnection,
  type ConnectionState,
  type NodeOrigin,
  getFitViewNodes,
  updateAbsolutePositions,
  getDimensions,
  XYError,
  XYErrorCode
} from '@xyflow/system';

import type { EdgeTypes, NodeTypes, Node, Edge, FitViewOptions } from '$lib/types';
import { initialEdgeTypes, initialNodeTypes, getInitialStore } from './initial-store';
import type { SvelteFlowStore } from './types';
import { syncNodeStores, syncEdgeStores, syncViewportStores } from './utils';
import { getVisibleEdges } from './visible-edges';
import { getVisibleNodes } from './visible-nodes';

export const key = Symbol();

export function createStore({
  nodes,
  edges,
  width,
  height,
  fitView: fitViewOnCreate,
  nodeOrigin,
  nodeExtent
}: {
  nodes?: Node[];
  edges?: Edge[];
  width?: number;
  height?: number;
  fitView?: boolean;
  nodeOrigin?: NodeOrigin;
  nodeExtent?: CoordinateExtent;
}): SvelteFlowStore {
  const store = getInitialStore({
    nodes,
    edges,
    width,
    height,
    fitView: fitViewOnCreate,
    nodeOrigin,
    nodeExtent
  });

  function setNodeTypes(nodeTypes: NodeTypes) {
    store.nodeTypes.set({
      ...initialNodeTypes,
      ...nodeTypes
    });
  }

  function setEdgeTypes(edgeTypes: EdgeTypes) {
    store.edgeTypes.set({
      ...initialEdgeTypes,
      ...edgeTypes
    });
  }

  function addEdge(edgeParams: Edge | Connection) {
    const edges = get(store.edges);
    store.edges.set(addEdgeUtil(edgeParams, edges));
  }

  const updateNodePositions: UpdateNodePositions = (nodeDragItems, dragging = false) => {
    const nodeLookup = get(store.nodeLookup);

    for (const [id, dragItem] of nodeDragItems) {
      const node = nodeLookup.get(id)?.internals.userNode;

      if (!node) {
        continue;
      }

      node.position = dragItem.position;
      node.dragging = dragging;
    }

    store.nodes.update((nds) => nds);
  };

  function updateNodeInternals(updates: Map<string, InternalNodeUpdate>) {
    const nodeLookup = get(store.nodeLookup);
    const parentLookup = get(store.parentLookup);
    const { changes, updatedInternals } = updateNodeInternalsSystem(
      updates,
      nodeLookup,
      get(store.parentLookup),
      get(store.domNode),
      get(store.nodeOrigin)
    );

    if (!updatedInternals) {
      return;
    }

    updateAbsolutePositions(nodeLookup, parentLookup, { nodeOrigin, nodeExtent });

    if (!get(store.fitViewOnInitDone) && get(store.fitViewOnInit)) {
      const fitViewOptions = get(store.fitViewOptions);
      const fitViewOnInitDone = fitViewSync({
        ...fitViewOptions,
        nodes: fitViewOptions?.nodes
      });
      store.fitViewOnInitDone.set(fitViewOnInitDone);
    }

    for (const change of changes) {
      const node = nodeLookup.get(change.id)?.internals.userNode;

      if (!node) {
        continue;
      }

      switch (change.type) {
        case 'dimensions': {
          const measured = { ...node.measured, ...change.dimensions };

          if (change.setAttributes) {
            node.width = change.dimensions?.width ?? node.width;
            node.height = change.dimensions?.height ?? node.height;
          }

          node.measured = measured;
          break;
        }
        case 'position':
          node.position = change.position ?? node.position;

          break;
      }
    }

    store.nodes.update((nds) => nds);

    if (!get(store.nodesInitialized)) {
      store.nodesInitialized.set(true);
    }
  }

  function fitView(options?: FitViewOptions) {
    const panZoom = get(store.panZoom);
    const domNode = get(store.domNode);

    if (!panZoom || !domNode) {
      return Promise.resolve(false);
    }

    const { width, height } = getDimensions(domNode);

    const fitViewNodes = getFitViewNodes(get(store.nodeLookup), options);

    return fitViewSystem(
      {
        nodes: fitViewNodes,
        width,
        height,
        minZoom: get(store.minZoom),
        maxZoom: get(store.maxZoom),
        panZoom
      },
      options
    );
  }

  function fitViewSync(options?: FitViewOptions) {
    const panZoom = get(store.panZoom);

    if (!panZoom) {
      return false;
    }

    const fitViewNodes = getFitViewNodes(get(store.nodeLookup), options);

    fitViewSystem(
      {
        nodes: fitViewNodes,
        width: get(store.width),
        height: get(store.height),
        minZoom: get(store.minZoom),
        maxZoom: get(store.maxZoom),
        panZoom
      },
      options
    );

    return fitViewNodes.size > 0;
  }

  function zoomBy(factor: number, options?: ViewportHelperFunctionOptions) {
    const panZoom = get(store.panZoom);
    if (!panZoom) {
      return Promise.resolve(false);
    }

    return panZoom.scaleBy(factor, options);
  }

  function zoomIn(options?: ViewportHelperFunctionOptions) {
    return zoomBy(1.2, options);
  }

  function zoomOut(options?: ViewportHelperFunctionOptions) {
    return zoomBy(1 / 1.2, options);
  }

  function setMinZoom(minZoom: number) {
    const panZoom = get(store.panZoom);

    if (panZoom) {
      panZoom.setScaleExtent([minZoom, get(store.maxZoom)]);
      store.minZoom.set(minZoom);
    }
  }

  function setMaxZoom(maxZoom: number) {
    const panZoom = get(store.panZoom);

    if (panZoom) {
      panZoom.setScaleExtent([get(store.minZoom), maxZoom]);
      store.maxZoom.set(maxZoom);
    }
  }

  function setTranslateExtent(extent: CoordinateExtent) {
    const panZoom = get(store.panZoom);

    if (panZoom) {
      panZoom.setTranslateExtent(extent);
      store.translateExtent.set(extent);
    }
  }

  function resetSelectedElements(elements: Node[] | Edge[]) {
    let elementsChanged = false;
    elements.forEach((element) => {
      if (element.selected) {
        element.selected = false;
        elementsChanged = true;
      }
    });
    return elementsChanged;
  }

  function setPaneClickDistance(distance: number) {
    get(store.panZoom)?.setClickDistance(distance);
  }

  function unselectNodesAndEdges(params?: { nodes?: Node[]; edges?: Edge[] }) {
    const resetNodes = resetSelectedElements(params?.nodes || get(store.nodes));
    if (resetNodes) store.nodes.set(get(store.nodes));

    const resetEdges = resetSelectedElements(params?.edges || get(store.edges));
    if (resetEdges) store.edges.set(get(store.edges));
  }

  store.deleteKeyPressed.subscribe(async (deleteKeyPressed) => {
    if (deleteKeyPressed) {
      const nodes = get(store.nodes);
      const edges = get(store.edges);
      const selectedNodes = nodes.filter((node) => node.selected);
      const selectedEdges = edges.filter((edge) => edge.selected);

      const { nodes: matchingNodes, edges: matchingEdges } = await getElementsToRemove({
        nodesToRemove: selectedNodes,
        edgesToRemove: selectedEdges,
        nodes,
        edges,
        onBeforeDelete: get(store.onbeforedelete)
      });

      if (matchingNodes.length || matchingEdges.length) {
        store.nodes.update((nds) =>
          nds.filter((node) => !matchingNodes.some((mN) => mN.id === node.id))
        );
        store.edges.update((eds) =>
          eds.filter((edge) => !matchingEdges.some((mE) => mE.id === edge.id))
        );

        get(store.ondelete)?.({
          nodes: matchingNodes,
          edges: matchingEdges
        });
      }
    }
  });

  function addSelectedNodes(ids: string[]) {
    const isMultiSelection = get(store.multiselectionKeyPressed);

    store.nodes.update((ns) =>
      ns.map((node) => {
        const nodeWillBeSelected = ids.includes(node.id);
        const selected = isMultiSelection
          ? node.selected || nodeWillBeSelected
          : nodeWillBeSelected;

        // we need to mutate the node here in order to have the correct selected state in the drag handler
        node.selected = selected;

        return node;
      })
    );

    if (!isMultiSelection) {
      store.edges.update((es) =>
        es.map((edge) => {
          edge.selected = false;
          return edge;
        })
      );
    }
  }

  function addSelectedEdges(ids: string[]) {
    const isMultiSelection = get(store.multiselectionKeyPressed);

    store.edges.update((edges) =>
      edges.map((edge) => {
        const edgeWillBeSelected = ids.includes(edge.id);
        const selected = isMultiSelection
          ? edge.selected || edgeWillBeSelected
          : edgeWillBeSelected;

        edge.selected = selected;

        return edge;
      })
    );

    if (!isMultiSelection) {
      store.nodes.update((ns) =>
        ns.map((node) => {
          node.selected = false;
          return node;
        })
      );
    }
  }

  function handleNodeSelection(id: string) {
    const node = get(store.nodes)?.find((n) => n.id === id);

    if (!node) {
      const error = new XYError(XYErrorCode.NODE_NOT_FOUND, id);
      console.warn(error.code, error.message);
      return;
    }

    store.selectionRect.set(null);
    store.selectionRectMode.set(null);

    if (!node.selected) {
      addSelectedNodes([id]);
    } else if (node.selected && get(store.multiselectionKeyPressed)) {
      unselectNodesAndEdges({ nodes: [node], edges: [] });
    }
  }

  function panBy(delta: XYPosition) {
    const viewport = get(store.viewport);
    return panBySystem({
      delta,
      panZoom: get(store.panZoom),
      transform: [viewport.x, viewport.y, viewport.zoom],
      translateExtent: get(store.translateExtent),
      width: get(store.width),
      height: get(store.height)
    });
  }

  const _connection = writable<ConnectionState>(initialConnection);
  const updateConnection: UpdateConnection = (newConnection: ConnectionState) => {
    _connection.set({ ...newConnection });
  };

  function cancelConnection() {
    _connection.set(initialConnection);
  }

  function reset() {
    store.fitViewOnInitDone.set(false);
    store.selectionRect.set(null);
    store.selectionRectMode.set(null);
    store.snapGrid.set(null);
    store.isValidConnection.set(() => true);

    unselectNodesAndEdges();
    cancelConnection();
  }

  return {
    // state
    ...store,

    // derived state
    visibleEdges: getVisibleEdges(store),
    visibleNodes: getVisibleNodes(store),
    connection: derived([_connection, store.viewport], ([connection, viewport]) => {
      return connection.inProgress
        ? {
            ...connection,
            to: pointToRendererPoint(connection.to, [viewport.x, viewport.y, viewport.zoom])
          }
        : { ...connection };
    }),
    markers: derived(
      [store.edges, store.defaultMarkerColor, store.flowId],
      ([edges, defaultColor, id]) => createMarkerIds(edges, { defaultColor, id })
    ),
    initialized: (() => {
      let initialized = false;
      const initialNodesLength = get(store.nodes).length;
      const initialEdgesLength = get(store.edges).length;
      return derived(
        [store.nodesInitialized, store.edgesInitialized, store.viewportInitialized],
        ([nodesInitialized, edgesInitialized, viewportInitialized]) => {
          // If it was already initialized, return true from then on
          if (initialized) return initialized;

          // if it hasn't been initialised check if it's now
          if (initialNodesLength === 0) {
            initialized = viewportInitialized;
          } else if (initialEdgesLength === 0) {
            initialized = viewportInitialized && nodesInitialized;
          } else {
            initialized = viewportInitialized && nodesInitialized && edgesInitialized;
          }

          return initialized;
        }
      );
    })(),

    // actions
    syncNodeStores: (nodes) => syncNodeStores(store.nodes, nodes),
    syncEdgeStores: (edges) => syncEdgeStores(store.edges, edges),
    syncViewport: (viewport) => syncViewportStores(store.panZoom, store.viewport, viewport),
    setNodeTypes,
    setEdgeTypes,
    addEdge,
    updateNodePositions,
    updateNodeInternals,
    zoomIn,
    zoomOut,
    fitView: (options?: FitViewOptions) => fitView(options),
    setMinZoom,
    setMaxZoom,
    setTranslateExtent,
    setPaneClickDistance,
    unselectNodesAndEdges,
    addSelectedNodes,
    addSelectedEdges,
    handleNodeSelection,
    panBy,
    updateConnection,
    cancelConnection,
    reset
  };
}

export function useStore(): SvelteFlowStore {
  const store = getContext<{ getStore: () => SvelteFlowStore }>(key);

  if (!store) {
    throw new Error(
      'In order to use useStore you need to wrap your component in a <SvelteFlowProvider />'
    );
  }

  return store.getStore();
}

export function createStoreContext({
  nodes,
  edges,
  width,
  height,
  fitView,
  nodeOrigin,
  nodeExtent
}: {
  nodes?: Node[];
  edges?: Edge[];
  width?: number;
  height?: number;
  fitView?: boolean;
  nodeOrigin?: NodeOrigin;
  nodeExtent?: CoordinateExtent;
}) {
  const store = createStore({ nodes, edges, width, height, fitView, nodeOrigin, nodeExtent });

  setContext(key, {
    getStore: () => store
  });

  return store;
}
