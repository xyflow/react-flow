import { createStore } from 'zustand';
import {
  clampPosition,
  fitView as fitViewSystem,
  updateNodes,
  updateAbsolutePositions,
  panBy as panBySystem,
  Dimensions,
  updateNodeDimensions as updateNodeDimensionsSystem,
} from '@xyflow/system';

import { applyNodeChanges, createSelectionChange, getSelectionChanges } from '../utils/changes';
import { updateNodesAndEdgesSelections } from './utils';
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
  FitViewOptions,
} from '../types';

const createRFStore = () =>
  createStore<ReactFlowState>((set, get) => ({
    ...initialState,
    setNodes: (nodes: Node[]) => {
      const { nodes: storeNodes, nodeOrigin, elevateNodesOnSelect } = get();
      const nextNodes = updateNodes(nodes, storeNodes, { nodeOrigin, elevateNodesOnSelect });

      set({ nodes: nextNodes });
    },
    getNodes: () => {
      return get().nodes;
    },
    setEdges: (edges: Edge[]) => {
      const { defaultEdgeOptions = {} } = get();
      set({ edges: edges.map((e) => ({ ...defaultEdgeOptions, ...e })) });
    },
    setDefaultNodesAndEdges: (nodes?: Node[], edges?: Edge[]) => {
      const hasDefaultNodes = typeof nodes !== 'undefined';
      const hasDefaultEdges = typeof edges !== 'undefined';

      const nextNodes = hasDefaultNodes
        ? updateNodes(nodes, [], {
            nodeOrigin: get().nodeOrigin,
            elevateNodesOnSelect: get().elevateNodesOnSelect,
          })
        : [];
      const nextEdges = hasDefaultEdges ? edges : [];

      set({ nodes: nextNodes, edges: nextEdges, hasDefaultNodes, hasDefaultEdges });
    },
    updateNodeDimensions: (updates) => {
      const { onNodesChange, fitView, nodes, fitViewOnInit, fitViewDone, fitViewOnInitOptions, domNode, nodeOrigin } =
        get();
      const changes: NodeDimensionChange[] = [];

      const updatedNodes = updateNodeDimensionsSystem(
        updates,
        nodes,
        domNode,
        nodeOrigin,
        (id: string, dimensions: Dimensions) => {
          changes.push({
            id: id,
            type: 'dimensions',
            dimensions,
          });
        }
      );

      if (!updatedNodes) {
        return;
      }

      const nextNodes = updateAbsolutePositions(updatedNodes, nodeOrigin);

      const nextFitViewDone =
        fitViewDone ||
        (fitViewOnInit &&
          fitView({
            ...fitViewOnInitOptions,
            nodes: nextNodes,
          }));

      set({ nodes: nextNodes, fitViewDone: nextFitViewDone });

      if (changes?.length > 0) {
        onNodesChange?.(changes);
      }
    },
    updateNodePositions: (nodeDragItems, positionChanged = true, dragging = false) => {
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

      get().triggerNodeChanges(changes);
    },

    triggerNodeChanges: (changes) => {
      const { onNodesChange, nodes, hasDefaultNodes, nodeOrigin, elevateNodesOnSelect } = get();

      if (changes?.length) {
        if (hasDefaultNodes) {
          const updatedNodes = applyNodeChanges(changes, nodes);
          const nextNodes = updateNodes(updatedNodes, nodes, {
            nodeOrigin,
            elevateNodesOnSelect,
          });
          set({ nodes: nextNodes });
        }

        onNodesChange?.(changes);
      }
    },

    addSelectedNodes: (selectedNodeIds) => {
      const { multiSelectionActive, edges, nodes } = get();
      let changedNodes: NodeSelectionChange[];
      let changedEdges: EdgeSelectionChange[] | null = null;

      if (multiSelectionActive) {
        changedNodes = selectedNodeIds.map((nodeId) => createSelectionChange(nodeId, true)) as NodeSelectionChange[];
      } else {
        changedNodes = getSelectionChanges(nodes, selectedNodeIds);
        changedEdges = getSelectionChanges(edges, []);
      }

      updateNodesAndEdgesSelections({
        changedNodes,
        changedEdges,
        get,
        set,
      });
    },
    addSelectedEdges: (selectedEdgeIds) => {
      const { multiSelectionActive, edges, nodes } = get();
      let changedEdges: EdgeSelectionChange[];
      let changedNodes: NodeSelectionChange[] | null = null;

      if (multiSelectionActive) {
        changedEdges = selectedEdgeIds.map((edgeId) => createSelectionChange(edgeId, true)) as EdgeSelectionChange[];
      } else {
        changedEdges = getSelectionChanges(edges, selectedEdgeIds);
        changedNodes = getSelectionChanges(nodes, []);
      }

      updateNodesAndEdgesSelections({
        changedNodes,
        changedEdges,
        get,
        set,
      });
    },
    unselectNodesAndEdges: ({ nodes, edges }: UnselectNodesAndEdgesParams = {}) => {
      const { edges: storeEdges, nodes: storeNodes } = get();
      const nodesToUnselect = nodes ? nodes : storeNodes;
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
    setMinZoom: (minZoom) => {
      const { panZoom, maxZoom } = get();
      panZoom?.setScaleExtent([minZoom, maxZoom]);

      set({ minZoom });
    },
    setMaxZoom: (maxZoom) => {
      const { panZoom, minZoom } = get();
      panZoom?.setScaleExtent([minZoom, maxZoom]);

      set({ maxZoom });
    },
    setTranslateExtent: (translateExtent) => {
      get().panZoom?.setTranslateExtent(translateExtent);

      set({ translateExtent });
    },
    resetSelectedElements: () => {
      const { edges, nodes } = get();

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
    setNodeExtent: (nodeExtent) => {
      const { nodes } = get();

      set({
        nodeExtent,
        nodes: nodes.map((node) => {
          const positionAbsolute = clampPosition(node.position, nodeExtent);

          return {
            ...node,
            positionAbsolute,
          };
        }),
      });
    },
    panBy: (delta): boolean => {
      const { transform, width, height, panZoom, translateExtent } = get();
      return panBySystem({ delta, panZoom, transform, translateExtent, width, height });
    },
    fitView: (options?: FitViewOptions): boolean => {
      const { panZoom, nodes, width, height, minZoom, maxZoom, nodeOrigin } = get();
      const fitViewNodes = options?.nodes || nodes;

      if (!panZoom) {
        return false;
      }

      return fitViewSystem(
        {
          nodes: fitViewNodes as Node[],
          width,
          height,
          panZoom,
          minZoom,
          maxZoom,
          nodeOrigin,
        },
        options
      );
    },
    cancelConnection: () =>
      set({
        connectionStatus: initialState.connectionStatus,
        connectionStartHandle: initialState.connectionStartHandle,
        connectionEndHandle: initialState.connectionEndHandle,
      }),
    updateConnection: (params) => {
      const { connectionStatus, connectionStartHandle, connectionEndHandle, connectionPosition } = get();

      const currentConnection = {
        connectionPosition: params.connectionPosition ?? connectionPosition,
        connectionStatus: params.connectionStatus ?? connectionStatus,
        connectionStartHandle: params.connectionStartHandle ?? connectionStartHandle,
        connectionEndHandle: params.connectionEndHandle ?? connectionEndHandle,
      };

      set(currentConnection);
    },
    reset: () => set({ ...initialState }),
  }));

export { createRFStore };
