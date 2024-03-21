import { createWithEqualityFn } from 'zustand/traditional';
import {
  clampPosition,
  fitView as fitViewSystem,
  adoptUserProvidedNodes,
  updateAbsolutePositions,
  panBy as panBySystem,
  updateNodeDimensions as updateNodeDimensionsSystem,
  updateConnectionLookup,
  InternalNodeBase,
  handleParentExpand,
} from '@xyflow/system';

import { applyEdgeChanges, applyNodeChanges, createSelectionChange, getSelectionChanges } from '../utils/changes';
import getInitialState from './initialState';
import type {
  ReactFlowState,
  Node,
  Edge,
  EdgeSelectionChange,
  NodeSelectionChange,
  UnselectNodesAndEdgesParams,
  FitViewOptions,
  NodeChange,
} from '../types';

const createRFStore = ({
  nodes,
  edges,
  defaultNodes,
  defaultEdges,
  width,
  height,
  fitView,
}: {
  nodes?: Node[];
  edges?: Edge[];
  defaultNodes?: Node[];
  defaultEdges?: Edge[];
  width?: number;
  height?: number;
  fitView?: boolean;
}) =>
  createWithEqualityFn<ReactFlowState>(
    (set, get) => ({
      ...getInitialState({ nodes, edges, width, height, fitView, defaultNodes, defaultEdges }),
      setNodes: (nodes: Node[]) => {
        const { nodeLookup, nodeOrigin, elevateNodesOnSelect } = get();
        // setNodes() is called exclusively in response to user actions:
        // - either when the `<ReactFlow nodes>` prop is updated in the controlled ReactFlow setup,
        // - or when the user calls something like `reactFlowInstance.setNodes()` in an uncontrolled ReactFlow setup.
        //
        // When this happens, we take the note objects passed by the user and extend them with fields
        // relevant for internal React Flow operations.
        adoptUserProvidedNodes(nodes, nodeLookup, { nodeOrigin, elevateNodesOnSelect });
        set({ nodes });
      },
      setEdges: (edges: Edge[]) => {
        const { connectionLookup, edgeLookup } = get();

        updateConnectionLookup(connectionLookup, edgeLookup, edges);

        set({ edges });
      },
      setDefaultNodesAndEdges: (nodes?: Node[], edges?: Edge[]) => {
        if (nodes) {
          const { setNodes } = get();
          setNodes(nodes);
          set({ hasDefaultNodes: true });
        }
        if (edges) {
          const { setEdges } = get();
          setEdges(edges);
          set({ hasDefaultEdges: true });
        }
      },
      // Every node gets registerd at a ResizeObserver. Whenever a node
      // changes its dimensions, this function is called to measure the
      // new dimensions and update the nodes.
      updateInternalNodeValues: (updates) => {
        const {
          onNodesChange,
          fitView,
          nodes,
          nodeLookup,
          fitViewOnInit,
          fitViewDone,
          fitViewOnInitOptions,
          domNode,
          nodeOrigin,
          debug,
        } = get();

        const { hasUpdate, changes } = updateNodeDimensionsSystem(updates, nodeLookup, domNode, nodeOrigin);

        if (!hasUpdate) {
          return;
        }

        updateAbsolutePositions(nodes, nodeLookup, nodeOrigin);

        // we call fitView once initially after all dimensions are set
        let nextFitViewDone = fitViewDone;
        if (!fitViewDone && fitViewOnInit) {
          nextFitViewDone = fitView(nodes, {
            ...fitViewOnInitOptions,
            nodes: fitViewOnInitOptions?.nodes || nodes,
          });
        }

        // here we are cirmumventing the onNodesChange handler
        // in order to be able to display nodes even if the user
        // has not provided an onNodesChange handler.
        // Nodes are only rendered if they have a width and height
        // attribute which they get from this handler.
        set({ nodes: nodes, fitViewDone: nextFitViewDone });

        if (changes?.length > 0) {
          if (debug) {
            console.log('React Flow: trigger node changes', changes);
          }
          onNodesChange?.(changes);
        }
      },
      updateNodePositions: (nodeDragItems, dragging = false) => {
        const { nodeLookup } = get();
        const triggerChangeNodes: InternalNodeBase[] = [];

        const changes = nodeDragItems.map((node) => {
          const change = {
            id: node.id,
            type: 'position',
            position: node.position,
            positionAbsolute: node.internals.positionAbsolute,
            dragging,
          };

          if (node.expandParent) {
            change.position.x = Math.max(node.position.x, 0);
            change.position.y = Math.max(node.position.y, 0);

            triggerChangeNodes.push(node as InternalNodeBase);
          }

          return change as NodeChange;
        });

        if (triggerChangeNodes.length > 0) {
          const parentExpandChanges = handleParentExpand(triggerChangeNodes, nodeLookup);
          changes.push(...parentExpandChanges);
        }

        get().triggerNodeChanges(changes);
      },
      triggerNodeChanges: (changes) => {
        const { onNodesChange, setNodes, nodes, hasDefaultNodes, debug } = get();

        if (changes?.length) {
          if (hasDefaultNodes) {
            const updatedNodes = applyNodeChanges(changes, nodes);
            setNodes(updatedNodes);
          }

          if (debug) {
            console.log('React Flow: trigger node changes', changes);
          }

          onNodesChange?.(changes);
        }
      },
      triggerEdgeChanges: (changes) => {
        const { onEdgesChange, setEdges, edges, hasDefaultEdges, debug } = get();

        if (changes?.length) {
          if (hasDefaultEdges) {
            const updatedEdges = applyEdgeChanges(changes, edges);
            setEdges(updatedEdges);
          }

          if (debug) {
            console.log('React Flow: trigger edge changes', changes);
          }

          onEdgesChange?.(changes);
        }
      },
      addSelectedNodes: (selectedNodeIds) => {
        const { multiSelectionActive, edgeLookup, nodeLookup, triggerNodeChanges, triggerEdgeChanges } = get();

        if (multiSelectionActive) {
          const nodeChanges = selectedNodeIds.map((nodeId) => createSelectionChange(nodeId, true));
          triggerNodeChanges(nodeChanges as NodeSelectionChange[]);
          return;
        }

        triggerNodeChanges(getSelectionChanges(nodeLookup, new Set([...selectedNodeIds]), true));
        triggerEdgeChanges(getSelectionChanges(edgeLookup));
      },
      addSelectedEdges: (selectedEdgeIds) => {
        const { multiSelectionActive, edgeLookup, nodeLookup, triggerNodeChanges, triggerEdgeChanges } = get();

        if (multiSelectionActive) {
          const changedEdges = selectedEdgeIds.map((edgeId) => createSelectionChange(edgeId, true));
          triggerEdgeChanges(changedEdges as EdgeSelectionChange[]);
          return;
        }

        triggerEdgeChanges(getSelectionChanges(edgeLookup, new Set([...selectedEdgeIds])));
        triggerNodeChanges(getSelectionChanges(nodeLookup, new Set(), true));
      },
      unselectNodesAndEdges: ({ nodes, edges }: UnselectNodesAndEdgesParams = {}) => {
        const { edges: storeEdges, nodes: storeNodes, triggerNodeChanges, triggerEdgeChanges } = get();
        const nodesToUnselect = nodes ? nodes : storeNodes;
        const edgesToUnselect = edges ? edges : storeEdges;

        const nodeChanges = nodesToUnselect.map((n) => {
          n.selected = false;
          return createSelectionChange(n.id, false);
        });
        const edgeChanges = edgesToUnselect.map((edge) => createSelectionChange(edge.id, false));

        triggerNodeChanges(nodeChanges as NodeSelectionChange[]);
        triggerEdgeChanges(edgeChanges as EdgeSelectionChange[]);
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
        const { edges, nodes, triggerNodeChanges, triggerEdgeChanges } = get();

        const nodeChanges = nodes.reduce<NodeSelectionChange[]>(
          (res, node) => (node.selected ? [...res, createSelectionChange(node.id, false) as NodeSelectionChange] : res),
          []
        );
        const edgeChanges = edges.reduce<EdgeSelectionChange[]>(
          (res, edge) => (edge.selected ? [...res, createSelectionChange(edge.id, false) as EdgeSelectionChange] : res),
          []
        );

        triggerNodeChanges(nodeChanges);
        triggerEdgeChanges(edgeChanges);
      },
      setNodeExtent: (nodeExtent) => {
        const { nodes, nodeLookup } = get();

        nodeLookup.forEach((node) => {
          const positionAbsolute = clampPosition(node.position, nodeExtent);

          nodeLookup.set(node.id, { ...node, internals: { ...node.internals, positionAbsolute } });
        });

        set({
          nodeExtent,
          nodes,
        });
      },
      panBy: (delta): boolean => {
        const { transform, width, height, panZoom, translateExtent } = get();
        return panBySystem({ delta, panZoom, transform, translateExtent, width, height });
      },
      fitView: (nodes: Node[], options?: FitViewOptions): boolean => {
        const { nodeLookup, panZoom, width, height, minZoom, maxZoom, nodeOrigin } = get();

        if (!panZoom) {
          return false;
        }

        return fitViewSystem(
          {
            nodes,
            nodeLookup,
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
          connectionStatus: null,
          connectionStartHandle: null,
          connectionEndHandle: null,
        }),
      updateConnection: (params) => {
        const { connectionPosition } = get();

        const currentConnection = {
          ...params,
          connectionPosition: params.connectionPosition ?? connectionPosition,
        };

        set(currentConnection);
      },

      reset: () => set({ ...getInitialState() }),
    }),
    Object.is
  );

export { createRFStore };
