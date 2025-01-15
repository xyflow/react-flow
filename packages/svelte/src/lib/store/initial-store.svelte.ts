import {
  infiniteExtent,
  SelectionMode,
  ConnectionMode,
  ConnectionLineType,
  devWarn,
  adoptUserNodes,
  getViewportForBounds,
  updateConnectionLookup,
  initialConnection,
  type SelectionRect,
  type SnapGrid,
  type MarkerProps,
  type PanZoomInstance,
  type CoordinateExtent,
  type NodeOrigin,
  type OnError,
  type Viewport,
  type OnConnect,
  type OnConnectStart,
  type OnConnectEnd,
  type NodeLookup,
  type ConnectionState,
  getInternalNodesBounds,
  createMarkerIds,
  type EdgeLookup,
  type ConnectionLookup,
  type ParentLookup,
  pointToRendererPoint,
  type ColorModeClass,
  type Transform
} from '@xyflow/system';

import DefaultNode from '$lib/components/nodes/DefaultNode.svelte';
import InputNode from '$lib/components/nodes/InputNode.svelte';
import OutputNode from '$lib/components/nodes/OutputNode.svelte';
import GroupNode from '$lib/components/nodes/GroupNode.svelte';

import {
  BezierEdgeInternal,
  SmoothStepEdgeInternal,
  StraightEdgeInternal,
  StepEdgeInternal
} from '$lib/components/edges';

import type {
  NodeTypes,
  EdgeTypes,
  FitViewOptions,
  OnDelete,
  OnEdgeCreate,
  OnBeforeDelete,
  IsValidConnection,
  Edge,
  Node,
  EdgeLayouted,
  InternalNode
} from '$lib/types';

import type { StoreSignals } from './types';
import { MediaQuery } from 'svelte/reactivity';
import { getLayoutedEdges, getVisibleNodes, type EdgeLayoutAllOptions } from './visibleElements';

export const initialNodeTypes = {
  input: InputNode,
  output: OutputNode,
  default: DefaultNode,
  group: GroupNode
};

export const initialEdgeTypes = {
  straight: StraightEdgeInternal,
  smoothstep: SmoothStepEdgeInternal,
  default: BezierEdgeInternal,
  step: StepEdgeInternal
};

export const getInitialStore = (signals: StoreSignals) => {
  // We use a class here, because Svelte adds getters & setter for us.
  // Inline classes have some performance implications but we just call it once (max twice).
  class SvelteFlowStore {
    _nodes: Node[] = $derived.by(() => {
      adoptUserNodes(signals.nodes, this.nodeLookup, this.parentLookup, {
        nodeExtent: this.nodeExtent,
        nodeOrigin: this.nodeOrigin,
        elevateNodesOnSelect: false,
        checkEquality: true
      });
      return signals.nodes;
    });

    _edges: Edge[] = $derived.by(() => {
      updateConnectionLookup(this.connectionLookup, this.edgeLookup, signals.edges);
      return signals.edges;
    });

    get nodes() {
      return this._nodes;
    }
    set nodes(nodes) {
      signals.nodes = nodes;
    }
    get edges() {
      return this._edges;
    }
    set edges(edges) {
      signals.edges = edges;
    }

    nodeLookup: NodeLookup = new Map();
    parentLookup: ParentLookup = new Map();
    connectionLookup: ConnectionLookup = new Map();
    edgeLookup: EdgeLookup = new Map();

    _prevVisibleEdges = new Map<string, EdgeLayouted>();
    visible = $derived.by(() => {
      const {
        // We need to access this._nodes to trigger on changes
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _nodes,
        _edges: edges,
        _prevVisibleEdges: previousEdges,
        nodeLookup,
        connectionMode,
        onerror,
        onlyRenderVisibleElements
      } = this;

      let visibleNodes: Map<string, InternalNode>;
      let visibleEdges: Map<string, EdgeLayouted>;

      const options = { edges, previousEdges, nodeLookup, connectionMode, onerror };

      if (onlyRenderVisibleElements) {
        // We only subscribe to viewport, width, height if onlyRenderVisibleElements is true
        const { viewport, width, height } = this;
        const transform: Transform = [viewport.x, viewport.y, viewport.zoom];

        visibleNodes = getVisibleNodes(nodeLookup, transform, width, height);
        visibleEdges = getLayoutedEdges({
          ...options,
          onlyRenderVisible: true,
          visibleNodes,
          transform,
          width,
          height
        });
      } else {
        visibleNodes = this.nodeLookup;
        visibleEdges = getLayoutedEdges(options as EdgeLayoutAllOptions);
      }

      return {
        nodes: visibleNodes,
        edges: visibleEdges
      };
    });

    domNode: HTMLDivElement | null = $derived(signals.domNode ?? null);
    width: number = $derived(signals.width ?? signals.props.width ?? 0);
    height: number = $derived(signals.height ?? signals.props.height ?? 0);

    flowId: string = $derived(signals.props.id ?? '1');
    minZoom: number = $derived(signals.props.minZoom ?? 0.5);
    maxZoom: number = $derived(signals.props.maxZoom ?? 2);

    nodeOrigin: NodeOrigin = $derived(signals.props.nodeOrigin ?? [0, 0]);
    nodeExtent: CoordinateExtent = $derived(signals.props.nodeExtent ?? infiniteExtent);
    translateExtent: CoordinateExtent = $derived(signals.props.translateExtent ?? infiniteExtent);

    defaultEdgeOptions: Partial<Edge> = $derived(signals.props.defaultEdgeOptions ?? {});

    nodeDragThreshold: number = $derived(signals.props.nodeDragThreshold ?? 1);
    autoPanOnNodeDrag: boolean = $derived(signals.props.autoPanOnNodeDrag ?? true);
    autoPanOnConnect: boolean = $derived(signals.props.autoPanOnConnect ?? true);

    fitViewOnInitDone: boolean = $state(false);
    fitViewOnInit: boolean = $derived(signals.props.fitView ?? false);
    fitViewOptions: FitViewOptions | undefined = $derived(signals.props.fitViewOptions);

    panZoom: PanZoomInstance | null = $state(null);
    snapGrid: SnapGrid | null = $derived(signals.props.snapGrid ?? null);

    dragging: boolean = $state(false);
    selectionRect: SelectionRect | null = $state(null);

    selectionKeyPressed: boolean = $state(false);
    multiselectionKeyPressed: boolean = $state(false);
    deleteKeyPressed: boolean = $state(false);
    panActivationKeyPressed: boolean = $state(false);
    zoomActivationKeyPressed: boolean = $state(false);
    selectionRectMode: string | null = $state(null);
    selectionMode: SelectionMode = $derived(signals.props.selectionMode ?? SelectionMode.Partial);

    nodeTypes: NodeTypes = $derived({ ...initialNodeTypes, ...signals.props.nodeTypes });
    edgeTypes: EdgeTypes = $derived({ ...initialEdgeTypes, ...signals.props.edgeTypes });

    // _viewport is the internal viewport.
    // when binding to viewport, we operate on signals.viewport instead
    _viewport: Viewport = $state(signals.props.initialViewport ?? { x: 0, y: 0, zoom: 1 });
    get viewport() {
      return signals.viewport ?? this._viewport;
    }
    set viewport(viewport: Viewport) {
      if (signals.viewport) {
        signals.viewport = viewport;
      }
      this._viewport = viewport;
    }

    // _connection is viewport independent and originating from XYHandle
    _connection: ConnectionState = $state(initialConnection);
    // We derive a viewport dependent connection here
    connection: ConnectionState = $derived.by(() => {
      if (this._connection.inProgress) {
        return {
          ...this._connection,
          to: pointToRendererPoint(this._connection.to, [
            this.viewport.x,
            this.viewport.y,
            this.viewport.zoom
          ])
        };
      } else {
        return this._connection;
      }
    });
    connectionLineType: ConnectionLineType = $derived(
      signals.props.connectionLineType ?? ConnectionLineType.Bezier
    );
    connectionMode: ConnectionMode = $derived(
      signals.props.connectionMode ?? ConnectionMode.Strict
    );
    connectionRadius: number = $derived(signals.props.connectionRadius ?? 20);
    isValidConnection: IsValidConnection = $derived(
      signals.props.isValidConnection ?? (() => true)
    );
    nodesDraggable: boolean = $derived(signals.props.nodesDraggable ?? true);
    nodesConnectable: boolean = $derived(signals.props.nodesConnectable ?? true);
    elementsSelectable: boolean = $derived(signals.props.elementsSelectable ?? true);
    selectNodesOnDrag: boolean = $derived(signals.props.selectNodesOnDrag ?? true);

    defaultMarkerColor: string = $derived(signals.props.defaultMarkerColor ?? '#b1b1b7');
    markers: MarkerProps[] = $derived.by(() => {
      return createMarkerIds(signals.edges, {
        defaultColor: this.defaultMarkerColor,
        id: this.flowId
      });
    });
    onlyRenderVisibleElements: boolean = $derived(signals.props.onlyRenderVisibleElements ?? false);
    onerror: OnError = $derived(signals.props.onerror ?? devWarn);
    ondelete?: OnDelete = $derived(signals.props.ondelete ?? undefined);
    onedgecreate?: OnEdgeCreate = $derived(signals.props.onedgecreate);
    onconnect?: OnConnect = $derived(signals.props.onconnect);
    onconnectstart?: OnConnectStart = $derived(signals.props.onconnectstart);
    onconnectend?: OnConnectEnd = $derived(signals.props.onconnectend);
    onbeforedelete?: OnBeforeDelete = $derived(signals.props.onbeforedelete);

    nodesInitialized: boolean = $state(false);
    edgesInitialized: boolean = $state(false);
    viewportInitialized: boolean = $state(false);

    _initialNodesLength: number = signals.nodes?.length ?? 0;
    _initialEdgesLength: number = signals.edges?.length ?? 0;
    initialized: boolean = $derived.by(() => {
      let initialized = false;
      // if it hasn't been initialised check if it's now
      if (this._initialNodesLength === 0) {
        initialized = this.viewportInitialized;
      } else if (this._initialEdgesLength === 0) {
        initialized = this.viewportInitialized && this.nodesInitialized;
      } else {
        initialized = this.viewportInitialized && this.nodesInitialized && this.edgesInitialized;
      }

      return initialized;
    });

    _prefersDark = new MediaQuery(
      '(prefers-color-scheme: dark)',
      signals.props.colorModeSSR === 'dark'
    );
    colorMode: ColorModeClass = $derived(
      signals.props.colorMode === 'system'
        ? this._prefersDark.current
          ? 'dark'
          : 'light'
        : (signals.props.colorMode ?? 'light')
    );

    constructor() {
      // Process intial fitView here
      if (signals.props.fitView && !signals.props.initialViewport && this.width && this.height) {
        const bounds = getInternalNodesBounds(this.nodeLookup, {
          filter: (node) =>
            !!((node.width || node.initialWidth) && (node.height || node.initialHeight))
        });
        this.viewport = getViewportForBounds(bounds, this.width, this.height, 0.5, 2, 0.1);
      }

      if (process.env.NODE_ENV === 'development') {
        warnIfDeeplyReactive(signals.nodes, 'nodes');
        warnIfDeeplyReactive(signals.edges, 'edges');
      }
    }

    resetStoreValues() {
      // TODO: reset all store values here
    }
  }
  return new SvelteFlowStore();
};

// Only way to check if an object is a proxy
// is to see if is failes to perform a structured clone
// TODO: is $state.raw really nessessary?
function warnIfDeeplyReactive(array: unknown[] | undefined, name: string) {
  try {
    if (array && array.length > 0) {
      structuredClone(array[0]);
    }
  } catch {
    console.warn(`Use $state.raw for ${name} to prevent performance issues.`);
  }
}
