import {
  fitView as fitViewSystem,
  panBy as panBySystem,
  updateNodeInternals as updateNodeInternalsSystem,
  addEdge as addEdgeUtil,
  initialConnection,
  errorMessages,
  type UpdateNodePositions,
  type InternalNodeUpdate,
  type ViewportHelperFunctionOptions,
  type Connection,
  type XYPosition,
  type CoordinateExtent,
  type UpdateConnection,
  type ConnectionState,
  getFitViewNodes,
  updateAbsolutePositions,
  getDimensions
} from '@xyflow/system';

import type { EdgeTypes, NodeTypes, Node, Edge, FitViewOptions } from '$lib/types';
import { initialEdgeTypes, initialNodeTypes, getInitialStore } from './initial-store.svelte';
import { type StoreSignals, type SvelteFlowStore, type SvelteFlowStoreActions } from './types';
// import { getVisibleEdges } from './visible-edges';
// import { getVisibleNodes } from './visible-nodes';

export const key = Symbol();

export { useStore } from '../hooks/useStore';

export function createStore(signals: StoreSignals): SvelteFlowStore {
  const store = getInitialStore(signals);

  function setNodeTypes(nodeTypes: NodeTypes) {
    store.nodeTypes = {
      ...initialNodeTypes,
      ...nodeTypes
    };
  }

  function setEdgeTypes(edgeTypes: EdgeTypes) {
    store.edgeTypes = {
      ...initialEdgeTypes,
      ...edgeTypes
    };
  }

  function addEdge(edgeParams: Edge | Connection) {
    store.edges = addEdgeUtil(edgeParams, store.edges);
  }

  const updateNodePositions: UpdateNodePositions = (nodeDragItems, dragging = false) => {
    store.nodes = store.nodes.map((node) => {
      const dragItem = nodeDragItems.get(node.id);
      return dragItem ? { ...node, position: dragItem.position, dragging } : node;
    });
  };

  function updateNodeInternals(updates: Map<string, InternalNodeUpdate>) {
    const { changes, updatedInternals } = updateNodeInternalsSystem(
      updates,
      store.nodeLookup,
      store.parentLookup,
      store.domNode,
      store.nodeOrigin
    );

    if (!updatedInternals) {
      return;
    }

    updateAbsolutePositions(store.nodeLookup, store.parentLookup, {
      nodeOrigin: store.nodeOrigin,
      nodeExtent: store.nodeExtent
    });

    if (!store.fitViewOnInitDone && store.fitViewOnInit) {
      const fitViewOnInitDone = fitViewSync({
        ...store.fitViewOptions,
        nodes: store.fitViewOptions?.nodes
      });
      if (fitViewOnInitDone) {
        store.fitViewOnInitDone = fitViewOnInitDone;
      }
    }

    const newNodes = new Map<string, Node>();
    for (const change of changes) {
      const userNode = store.nodeLookup.get(change.id)?.internals.userNode;

      if (!userNode) {
        continue;
      }

      const node = { ...userNode };

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

      newNodes.set(change.id, node);
    }

    store.nodes = store.nodes.map((node) => newNodes.get(node.id) ?? node);

    if (!store.nodesInitialized) {
      store.nodesInitialized = true;
    }
  }

  function fitView(options?: FitViewOptions) {
    const panZoom = store.panZoom;
    const domNode = store.domNode;

    if (!panZoom || !domNode) {
      return Promise.resolve(false);
    }

    const { width, height } = getDimensions(domNode);

    const fitViewNodes = getFitViewNodes(store.nodeLookup, options);

    return fitViewSystem(
      {
        nodes: fitViewNodes,
        width,
        height,
        minZoom: store.minZoom,
        maxZoom: store.maxZoom,
        panZoom
      },
      options
    );
  }

  function fitViewSync(options?: FitViewOptions) {
    const panZoom = store.panZoom;

    if (!panZoom) {
      return false;
    }

    const fitViewNodes = getFitViewNodes(store.nodeLookup, options);

    fitViewSystem(
      {
        nodes: fitViewNodes,
        width: store.width,
        height: store.height,
        minZoom: store.minZoom,
        maxZoom: store.maxZoom,
        panZoom
      },
      options
    );

    return fitViewNodes.size > 0;
  }

  function zoomBy(factor: number, options?: ViewportHelperFunctionOptions) {
    const panZoom = store.panZoom;
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
    const panZoom = store.panZoom;

    if (panZoom) {
      panZoom.setScaleExtent([minZoom, store.maxZoom]);
      store.minZoom = minZoom;
    }
  }

  function setMaxZoom(maxZoom: number) {
    const panZoom = store.panZoom;

    if (panZoom) {
      panZoom.setScaleExtent([store.minZoom, maxZoom]);
      store.maxZoom = maxZoom;
    }
  }

  function setTranslateExtent(extent: CoordinateExtent) {
    const panZoom = store.panZoom;

    if (panZoom) {
      panZoom.setTranslateExtent(extent);
      store.translateExtent = extent;
    }
  }

  function setPaneClickDistance(distance: number) {
    store.panZoom?.setClickDistance(distance);
  }

  function deselect<T extends Node | Edge>(
    elements: T[],
    elementsToDeselect: Set<string> | null = null
  ): [boolean, T[]] {
    let deselected = false;

    const newElements = elements.map((element) => {
      const shouldDeselect = elementsToDeselect ? elementsToDeselect.has(element.id) : true;

      if (shouldDeselect && element.selected) {
        deselected = true;
        return { ...element, selected: false };
      }
      return element;
    });

    return [deselected, newElements];
  }

  function unselectNodesAndEdges(params?: { nodes?: Node[]; edges?: Edge[] }) {
    const nodesToDeselect = params?.nodes ? new Set(params.nodes.map((node) => node.id)) : null;
    const [nodesDeselected, newNodes] = deselect(store.nodes, nodesToDeselect);
    if (nodesDeselected) {
      store.nodes = newNodes;
    }

    const edgesToDeselect = params?.edges ? new Set(params.edges.map((node) => node.id)) : null;
    const [edgesDeselected, newEdges] = deselect(store.edges, edgesToDeselect);
    if (edgesDeselected) {
      store.edges = newEdges;
    }
  }

  function addSelectedNodes(ids: string[]) {
    const isMultiSelection = store.multiselectionKeyPressed;

    store.nodes = store.nodes.map((node) => {
      const nodeWillBeSelected = ids.includes(node.id);
      const selected = isMultiSelection ? node.selected || nodeWillBeSelected : nodeWillBeSelected;

      if (node.selected !== selected) {
        // we need to mutate the node here in order to have the correct selected state in the drag handler
        const internalNode = store.nodeLookup.get(node.id);
        if (internalNode) internalNode.selected = selected;
        node.selected = selected;
        return { ...node };
      }
      return node;
    });

    if (!isMultiSelection) {
      unselectNodesAndEdges({ nodes: [] });
    }
  }

  function addSelectedEdges(ids: string[]) {
    const isMultiSelection = store.multiselectionKeyPressed;

    store.edges = store.edges.map((edge) => {
      const edgeWillBeSelected = ids.includes(edge.id);
      const selected = isMultiSelection ? edge.selected || edgeWillBeSelected : edgeWillBeSelected;

      if (edge.selected !== selected) {
        return { ...edge, selected };
      }
      return edge;
    });

    if (!isMultiSelection) {
      unselectNodesAndEdges({ edges: [] });
    }
  }

  function handleNodeSelection(id: string) {
    const node = store.nodeLookup.get(id);

    if (!node) {
      console.warn('012', errorMessages['error012'](id));
      return;
    }

    store.selectionRect = null;
    store.selectionRectMode = null;

    if (!node.selected) {
      addSelectedNodes([id]);
    } else if (node.selected && store.multiselectionKeyPressed) {
      unselectNodesAndEdges({ nodes: [node], edges: [] });
    }
  }

  function handleEdgeSelection(id: string) {
    const edge = store.edgeLookup.get(id);

    if (!edge) {
      console.warn('012', errorMessages['error012'](id));
      return;
    }

    const selectable =
      edge.selectable || (store.elementsSelectable && typeof edge.selectable === 'undefined');

    if (selectable) {
      store.selectionRect = null;
      store.selectionRectMode = null;

      if (!edge.selected) {
        addSelectedEdges([id]);
      } else if (edge.selected && store.multiselectionKeyPressed) {
        unselectNodesAndEdges({ nodes: [], edges: [edge] });
      }
    }
  }

  function panBy(delta: XYPosition) {
    return panBySystem({
      delta,
      panZoom: store.panZoom,
      transform: [store.viewport.x, store.viewport.y, store.viewport.zoom],
      translateExtent: store.translateExtent,
      width: store.width,
      height: store.height
    });
  }

  const updateConnection: UpdateConnection = (newConnection: ConnectionState) => {
    store._connection = { ...newConnection };
  };

  function cancelConnection() {
    store._connection = initialConnection;
  }

  function reset() {
    store.fitViewOnInitDone = false;
    store.selectionRect = null;
    store.selectionRectMode = null;

    unselectNodesAndEdges();
    cancelConnection();
  }

  const storeWithActions = Object.assign(store, {
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
    handleEdgeSelection,
    panBy,
    updateConnection,
    cancelConnection,
    reset
  } satisfies SvelteFlowStoreActions);

  return storeWithActions;
}
