import type {
  InternalNodeUpdate,
  XYPosition,
  ViewportHelperFunctionOptions,
  Connection,
  UpdateNodePositions,
  CoordinateExtent,
  UpdateConnection,
  Viewport
} from '@xyflow/system';

import type { getInitialStore } from './initial-store.svelte';
import type { Node, Edge, NodeTypes, EdgeTypes, FitViewOptions } from '$lib/types';
import type { SvelteFlowProps } from '$lib/container/SvelteFlow';

export type SvelteFlowStoreActions = {
  setNodeTypes: (nodeTypes: NodeTypes) => void;
  setEdgeTypes: (edgeTypes: EdgeTypes) => void;
  addEdge: (edge: Edge | Connection) => void;
  zoomIn: (options?: ViewportHelperFunctionOptions) => Promise<boolean>;
  zoomOut: (options?: ViewportHelperFunctionOptions) => Promise<boolean>;
  setMinZoom: (minZoom: number) => void;
  setMaxZoom: (maxZoom: number) => void;
  setTranslateExtent: (extent: CoordinateExtent) => void;
  setPaneClickDistance: (distance: number) => void;
  fitView: (options?: FitViewOptions) => Promise<boolean>;
  updateNodePositions: UpdateNodePositions;
  updateNodeInternals: (updates: Map<string, InternalNodeUpdate>) => void;
  unselectNodesAndEdges: (params?: { nodes?: Node[]; edges?: Edge[] }) => void;
  addSelectedNodes: (ids: string[]) => void;
  addSelectedEdges: (ids: string[]) => void;
  handleNodeSelection: (id: string) => void;
  handleEdgeSelection: (id: string) => void;
  panBy: (delta: XYPosition) => Promise<boolean>;
  updateConnection: UpdateConnection;
  cancelConnection: () => void;
  reset(): void;
};

export type StoreSignals = {
  props: Partial<SvelteFlowProps>;
  domNode?: HTMLDivElement;
  width?: number;
  height?: number;
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
};

export type SvelteFlowStoreState = ReturnType<typeof getInitialStore>;

export type SvelteFlowStore = SvelteFlowStoreState & SvelteFlowStoreActions;

export type StoreContext = {
  getStore: () => SvelteFlowStore;
  provider: boolean;
};

export type ProviderContext = StoreContext & {
  setStore: (store: SvelteFlowStore) => void;
};
