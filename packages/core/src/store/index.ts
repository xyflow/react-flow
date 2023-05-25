import { createStore } from 'zustand';
import { clampPosition, getDimensions, fitView, getHandleBounds } from '@reactflow/utils';
import {
  internalsSymbol,
  type NodeDimensionUpdate,
  type CoordinateExtent,
  type NodeDragItem,
  type XYPosition,
} from '@reactflow/system';

import { applyNodeChanges, createSelectionChange, getSelectionChanges } from '../utils/changes';
import { createNodeInternals, updateAbsoluteNodePositions, updateNodesAndEdgesSelections } from './utils';
import initialState from './initialState';
import type {
  ReactFlowState,
  Node,
  Edge,
  NodeDimensionChange,
  EdgeSelectionChange,
  NodeSelectionChange,
  NodePositionChange,
  UnselectNodesAndEdgesParams,
  NodeChange,
} from '../types';

const createRFStore = () =>
  createStore<ReactFlowState>((set, get) => ({
    ...initialState,
    setNodes: (nodes: Node[]) => {
      const { nodeInternals, nodeOrigin, elevateNodesOnSelect } = get();
      set({ nodeInternals: createNodeInternals(nodes, nodeInternals, nodeOrigin, elevateNodesOnSelect) });
    },
    getNodes: () => {
      return Array.from(get().nodeInternals.values());
    },
    setEdges: (edges: Edge[]) => {
      const { defaultEdgeOptions = {} } = get();
      set({ edges: edges.map((e) => ({ ...defaultEdgeOptions, ...e })) });
    },
    setDefaultNodesAndEdges: (nodes?: Node[], edges?: Edge[]) => {
      const hasDefaultNodes = typeof nodes !== 'undefined';
      const hasDefaultEdges = typeof edges !== 'undefined';

      const nodeInternals = hasDefaultNodes
        ? createNodeInternals(nodes, new Map(), get().nodeOrigin, get().elevateNodesOnSelect)
        : new Map();
      const nextEdges = hasDefaultEdges ? edges : [];

      set({ nodeInternals, edges: nextEdges, hasDefaultNodes, hasDefaultEdges });
    },
    updateNodeDimensions: (updates: NodeDimensionUpdate[]) => {
      const {
        onNodesChange,
        nodeInternals,
        fitViewOnInit,
        fitViewOnInitDone,
        fitViewOnInitOptions,
        domNode,
        nodeOrigin,
        width,
        height,
        minZoom,
        maxZoom,
        panZoom,
      } = get();
      const viewportNode = domNode?.querySelector('.react-flow__viewport');

      if (!viewportNode) {
        return;
      }

      const style = window.getComputedStyle(viewportNode);
      const { m22: zoom } = new window.DOMMatrixReadOnly(style.transform);

      const changes: NodeDimensionChange[] = updates.reduce<NodeDimensionChange[]>((res, update) => {
        const node = nodeInternals.get(update.id);

        if (node) {
          const dimensions = getDimensions(update.nodeElement);
          const doUpdate = !!(
            dimensions.width &&
            dimensions.height &&
            (node.width !== dimensions.width || node.height !== dimensions.height || update.forceUpdate)
          );

          if (doUpdate) {
            nodeInternals.set(node.id, {
              ...node,
              [internalsSymbol]: {
                ...node[internalsSymbol],
                handleBounds: {
                  source: getHandleBounds('.source', update.nodeElement, zoom, node.origin || nodeOrigin),
                  target: getHandleBounds('.target', update.nodeElement, zoom, node.origin || nodeOrigin),
                },
              },
              ...dimensions,
            });

            res.push({
              id: node.id,
              type: 'dimensions',
              dimensions,
            });
          }
        }

        return res;
      }, []);

      updateAbsoluteNodePositions(nodeInternals, nodeOrigin);

      const nextFitViewOnInitDone =
        fitViewOnInitDone ||
        (fitViewOnInit &&
          !fitViewOnInitDone &&
          !!panZoom &&
          fitView(
            {
              nodes: Array.from(nodeInternals.values()),
              width,
              height,
              panZoom,
              minZoom,
              maxZoom,
              nodeOrigin,
            },
            fitViewOnInitOptions
          ));
      set({ nodeInternals: new Map(nodeInternals), fitViewOnInitDone: nextFitViewOnInitDone });

      if (changes?.length > 0) {
        onNodesChange?.(changes);
      }
    },
    updateNodePositions: (nodeDragItems: NodeDragItem[] | Node[], positionChanged = true, dragging = false) => {
      const { triggerNodeChanges } = get();

      const changes = nodeDragItems.map((node) => {
        const change: NodePositionChange = {
          id: node.id,
          type: 'position',
          dragging,
        };

        if (positionChanged) {
          change.positionAbsolute = node.positionAbsolute;
          change.position = node.position;
        }

        return change;
      });

      triggerNodeChanges(changes);
    },

    triggerNodeChanges: (changes: NodeChange[]) => {
      const { onNodesChange, nodeInternals, hasDefaultNodes, nodeOrigin, getNodes, elevateNodesOnSelect } = get();

      if (changes?.length) {
        if (hasDefaultNodes) {
          const nodes = applyNodeChanges(changes, getNodes());
          const nextNodeInternals = createNodeInternals(nodes, nodeInternals, nodeOrigin, elevateNodesOnSelect);
          set({ nodeInternals: nextNodeInternals });
        }

        onNodesChange?.(changes);
      }
    },

    addSelectedNodes: (selectedNodeIds: string[]) => {
      const { multiSelectionActive, edges, getNodes } = get();
      let changedNodes: NodeSelectionChange[];
      let changedEdges: EdgeSelectionChange[] | null = null;

      if (multiSelectionActive) {
        changedNodes = selectedNodeIds.map((nodeId) => createSelectionChange(nodeId, true)) as NodeSelectionChange[];
      } else {
        changedNodes = getSelectionChanges(getNodes(), selectedNodeIds);
        changedEdges = getSelectionChanges(edges, []);
      }

      updateNodesAndEdgesSelections({
        changedNodes,
        changedEdges,
        get,
        set,
      });
    },
    addSelectedEdges: (selectedEdgeIds: string[]) => {
      const { multiSelectionActive, edges, getNodes } = get();
      let changedEdges: EdgeSelectionChange[];
      let changedNodes: NodeSelectionChange[] | null = null;

      if (multiSelectionActive) {
        changedEdges = selectedEdgeIds.map((edgeId) => createSelectionChange(edgeId, true)) as EdgeSelectionChange[];
      } else {
        changedEdges = getSelectionChanges(edges, selectedEdgeIds);
        changedNodes = getSelectionChanges(getNodes(), []);
      }

      updateNodesAndEdgesSelections({
        changedNodes,
        changedEdges,
        get,
        set,
      });
    },
    unselectNodesAndEdges: ({ nodes, edges }: UnselectNodesAndEdgesParams = {}) => {
      const { edges: storeEdges, getNodes } = get();
      const nodesToUnselect = nodes ? nodes : getNodes();
      const edgesToUnselect = edges ? edges : storeEdges;

      const changedNodes = nodesToUnselect.map((n) => {
        n.selected = false;
        return createSelectionChange(n.id, false);
      }) as NodeSelectionChange[];
      const changedEdges = edgesToUnselect.map((edge) =>
        createSelectionChange(edge.id, false)
      ) as EdgeSelectionChange[];

      updateNodesAndEdgesSelections({
        changedNodes,
        changedEdges,
        get,
        set,
      });
    },
    setMinZoom: (minZoom: number) => {
      const { panZoom, maxZoom } = get();
      panZoom?.setScaleExtent([minZoom, maxZoom]);

      set({ minZoom });
    },
    setMaxZoom: (maxZoom: number) => {
      const { panZoom, minZoom } = get();
      panZoom?.setScaleExtent([minZoom, maxZoom]);

      set({ maxZoom });
    },
    setTranslateExtent: (translateExtent: CoordinateExtent) => {
      get().panZoom?.setTranslateExtent(translateExtent);

      set({ translateExtent });
    },
    resetSelectedElements: () => {
      const { edges, getNodes } = get();
      const nodes = getNodes();

      const nodesToUnselect = nodes
        .filter((e) => e.selected)
        .map((n) => createSelectionChange(n.id, false)) as NodeSelectionChange[];
      const edgesToUnselect = edges
        .filter((e) => e.selected)
        .map((e) => createSelectionChange(e.id, false)) as EdgeSelectionChange[];

      updateNodesAndEdgesSelections({
        changedNodes: nodesToUnselect,
        changedEdges: edgesToUnselect,
        get,
        set,
      });
    },
    setNodeExtent: (nodeExtent: CoordinateExtent) => {
      const { nodeInternals } = get();

      nodeInternals.forEach((node) => {
        node.positionAbsolute = clampPosition(node.position, nodeExtent);
      });

      set({
        nodeExtent,
        nodeInternals: new Map(nodeInternals),
      });
    },
    panBy: (delta: XYPosition): boolean => {
      const { transform, width, height, panZoom, translateExtent } = get();

      if (!panZoom || (!delta.x && !delta.y)) {
        return false;
      }

      const extent: CoordinateExtent = [
        [0, 0],
        [width, height],
      ];

      const constrainedTransform = panZoom.setViewportConstrained(
        { x: transform[0] + delta.x, y: transform[1] + delta.y, zoom: transform[2] },
        extent,
        translateExtent
      );

      const transformChanged =
        !!constrainedTransform &&
        (transform[0] !== constrainedTransform.x ||
          transform[1] !== constrainedTransform.y ||
          transform[2] !== constrainedTransform.k);

      return transformChanged;
    },
    cancelConnection: () =>
      set({
        connectionNodeId: initialState.connectionNodeId,
        connectionHandleId: initialState.connectionHandleId,
        connectionHandleType: initialState.connectionHandleType,
        connectionStatus: initialState.connectionStatus,
        connectionStartHandle: initialState.connectionStartHandle,
        connectionEndHandle: initialState.connectionEndHandle,
      }),
    reset: () => set({ ...initialState }),
  }));

export { createRFStore };
