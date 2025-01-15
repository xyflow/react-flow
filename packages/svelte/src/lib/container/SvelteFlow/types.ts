import type { DOMAttributes } from 'svelte/elements';
import type {
  ConnectionLineType,
  NodeOrigin,
  Viewport,
  SelectionMode,
  SnapGrid,
  OnMoveStart,
  OnMove,
  OnMoveEnd,
  CoordinateExtent,
  PanOnScrollMode,
  OnError,
  ConnectionMode,
  PanelPosition,
  ProOptions,
  ColorMode,
  OnConnect,
  OnConnectStart,
  OnConnectEnd,
  ColorModeClass
} from '@xyflow/system';

import type {
  Edge,
  Node,
  NodeTypes,
  KeyDefinition,
  EdgeTypes,
  DefaultEdgeOptions,
  FitViewOptions,
  OnDelete,
  OnEdgeCreate,
  OnBeforeDelete,
  IsValidConnection
} from '$lib/types';

import type { Snippet } from 'svelte';
import type { EdgeEvents, NodeEvents, NodeSelectionEvents, PaneEvents } from '$lib/types/events';

export type SvelteFlowProps = NodeEvents &
  NodeSelectionEvents &
  EdgeEvents &
  PaneEvents &
  DOMAttributes<HTMLDivElement> & {
    /** The id of the flow
     *
     * This is necessary if you want to render multiple flows.
     * @optional
     */
    id?: string;
    /** An array of nodes to render in a controlled flow.
     * @example
     * const nodes = $state.raw([
     *  {
     *    id: 'node-1',
     *    type: 'input',
     *    data: { label: 'Node 1' },
     *    position: { x: 250, y: 50 }
     *  }
     * ]);
     */
    nodes?: Node[];
    /** An array of edges to render in a controlled flow.
     * @example
     * const edges = $state.raw([
     *  {
     *    id: 'edge-1-2',
     *    source: 'node-1',
     *    target: 'node-2',
     *  }
     * ]);
     */
    edges?: Edge[];
    /** Custom node types to be available in a flow.
     *
     * Svelte Flow matches a node's type to a component in the nodeTypes object.
     * @example
     * import CustomNode from './CustomNode.svelte';
     *
     * const nodeTypes = { nameOfNodeType: CustomNode };
     */
    nodeTypes?: NodeTypes;
    /** Custom edge types to be available in a flow.
     *
     * Svelte Flow matches an edge's type to a component in the edgeTypes object.
     * @example
     * import CustomEdge from './CustomEdge.svelte';
     *
     * const edgeTypes = { nameOfEdgeType: CustomEdge };
     */
    edgeTypes?: EdgeTypes;
    /** Pressing down this key you can select multiple elements with a selection box.
     * @default 'Shift'
     */
    selectionKey?: KeyDefinition | KeyDefinition[] | null;
    /** If a key is set, you can pan the viewport while that key is held down even if panOnScroll is set to false.
     *
     * By setting this prop to null you can disable this functionality.
     * @default 'Space'
     */
    panActivationKey?: KeyDefinition | KeyDefinition[] | null;
    /** Pressing down this key deletes all selected nodes & edges.
     * @default 'Backspace'
     */
    deleteKey?: KeyDefinition | KeyDefinition[] | null;
    /** Pressing down this key you can select multiple elements by clicking.
     * @default 'Meta' for macOS, "Ctrl" for other systems
     */
    multiSelectionKey?: KeyDefinition | KeyDefinition[] | null;
    /** If a key is set, you can zoom the viewport while that key is held down even if panOnScroll is set to false.
     *
     * By setting this prop to null you can disable this functionality.
     * @default 'Meta' for macOS, "Ctrl" for other systems
     * */
    zoomActivationKey?: KeyDefinition | KeyDefinition[] | null;
    /** If set, initial viewport will show all nodes & edges */
    fitView?: boolean;
    /** Options to be used in combination with fitView
     * @example
     * const fitViewOptions = {
     *  padding: 0.1,
     *  includeHiddenNodes: false,
     *  minZoom: 0.1,
     *  maxZoom: 1,
     *  duration: 200,
     *  nodes: [{id: 'node-1'}, {id: 'node-2'}], // nodes to fit
     * };
     */
    fitViewOptions?: FitViewOptions;
    /** Defines nodes relative position to its coordinates
     * @example
     * [0, 0] // default, top left
     * [0.5, 0.5] // center
     * [1, 1] // bottom right
     */
    nodeOrigin?: NodeOrigin;
    /** With a threshold greater than zero you can control the distinction between node drag and click events.
     *
     * If threshold equals 1, you need to drag the node 1 pixel before a drag event is fired.
     * @default 1
     */
    nodeDragThreshold?: number;
    /** Distance that the mouse can move between mousedown/up that will trigger a click
     * @default 0
     */
    paneClickDistance?: number;
    /** Distance that the mouse can move between mousedown/up that will trigger a click
     * @default 0
     */
    nodeClickDistance?: number;
    /** Minimum zoom level
     * @default 0.5
     */
    minZoom?: number;
    /** Maximum zoom level
     * @default 2
     */
    maxZoom?: number;
    /** Sets the initial position and zoom of the viewport.
     *
     * If a default viewport is provided but fitView is enabled, the default viewport will be ignored.
     * @example
     * const initialViewport = {
     *  zoom: 0.5,
     *  position: { x: 0, y: 0 }
     * };
     */
    initialViewport?: Viewport;
    /** Custom viewport to be used instead of internal one */
    viewport?: Viewport;
    /** The radius around a handle where you drop a connection line to create a new edge.
     * @default 20
     */
    connectionRadius?: number;
    /** 'strict' connection mode will only allow you to connect source handles to target handles.
     *
     * 'loose' connection mode will allow you to connect handles of any type to one another.
     * @default 'strict'
     */
    connectionMode?: ConnectionMode;
    /** Provide a custom snippet to be used insted of the default connection line */
    connectionLine?: Snippet;
    /** Styles to be applied to the connection line */
    connectionLineStyle?: string;
    /** Styles to be applied to the container of the connection line */
    connectionLineContainerStyle?: string;
    /** When set to "partial", when the user creates a selection box by click and dragging nodes that are only partially in the box are still selected.
     * @default 'full'
     */
    selectionMode?: SelectionMode;
    /**
     * Controls if nodes should be automatically selected when being dragged
     */
    selectNodesOnDrag?: boolean;
    /** Grid all nodes will snap to
     * @example [20, 20]
     */
    snapGrid?: SnapGrid;
    /** Color of edge markers
     * @example "#b1b1b7"
     */
    defaultMarkerColor?: string;
    /** Controls if all nodes should be draggable
     * @default true
     */
    nodesDraggable?: boolean;
    /** Controls if all nodes should be connectable to each other
     * @default true
     */
    nodesConnectable?: boolean;
    /** Controls if all elements should (nodes & edges) be selectable
     * @default true
     */
    elementsSelectable?: boolean;
    /** By default the viewport extends infinitely. You can use this prop to set a boundary.
     *
     * The first pair of coordinates is the top left boundary and the second pair is the bottom right.
     * @example [[-1000, -10000], [1000, 1000]]
     */
    translateExtent?: CoordinateExtent;
    /** By default the nodes can be placed anywhere. You can use this prop to set a boundary.
     *
     * The first pair of coordinates is the top left boundary and the second pair is the bottom right.
     * @example [[-1000, -10000], [1000, 1000]]
     */
    nodeExtent?: CoordinateExtent;
    /** Disabling this prop will allow the user to scroll the page even when their pointer is over the flow.
     * @default true
     */
    preventScrolling?: boolean;
    /** Controls if the viewport should zoom by scrolling inside the container */
    zoomOnScroll?: boolean;
    /** Controls if the viewport should zoom by double clicking somewhere on the flow */
    zoomOnDoubleClick?: boolean;
    /** Controls if the viewport should zoom by pinching on a touch screen */
    zoomOnPinch?: boolean;
    /** Controls if the viewport should pan by scrolling inside the container
     *
     * Can be limited to a specific direction with panOnScrollMode
     */
    panOnScroll?: boolean;
    /** This prop is used to limit the direction of panning when panOnScroll is enabled.
     *
     * The "free" option allows panning in any direction.
     * @default "free"
     * @example "horizontal" | "vertical"
     */
    panOnScrollMode?: PanOnScrollMode;
    /** Enableing this prop allows users to pan the viewport by clicking and dragging.
     *
     * You can also set this prop to an array of numbers to limit which mouse buttons can activate panning.
     * @example [0, 2] // allows panning with the left and right mouse buttons
     * [0, 1, 2, 3, 4] // allows panning with all mouse buttons
     */
    panOnDrag?: boolean | number[];
    /** Select multiple elements with a selection box, without pressing down selectionKey */
    selectionOnDrag?: boolean;
    /** You can enable this optimisation to instruct Svelte Flow to only render nodes and edges that would be visible in the viewport.
     *
     * This might improve performance when you have a large number of nodes and edges but also adds an overhead.
     * @default false
     */
    onlyRenderVisibleElements?: boolean;
    /** You can enable this prop to automatically pan the viewport while making a new connection.
     * @default true
     */
    autoPanOnConnect?: boolean;
    /** You can enable this prop to automatically pan the viewport while dragging a node.
     * @default true
     */
    autoPanOnNodeDrag?: boolean;
    /** Set position of the attribution
     * @default 'bottom-right'
     * @example 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
     */
    attributionPosition?: PanelPosition;
    /** By default, we render a small attribution in the corner of your flows that links back to the project.
     *
     * Anyone is free to remove this attribution whether they're a Pro subscriber or not
     * but we ask that you take a quick look at our {@link https://reactflow.dev/learn/troubleshooting/remove-attribution | removing attribution guide}
     * before doing so.
     */
    proOptions?: ProOptions;
    /** Defaults to be applied to all new edges that are added to the flow.
     *
     * Properties on a new edge will override these defaults if they exist.
     * @example
     * const defaultEdgeOptions = {
     *  type: 'customEdgeType',
     *  animated: true,
     *  interactionWidth: 10,
     *  data: { label: 'custom label' },
     *  hidden: false,
     *  deletable: true,
     *  selected: false,
     *  focusable: true,
     *  markerStart: EdgeMarker.ArrowClosed,
     *  markerEnd: EdgeMarker.ArrowClosed,
     *  zIndex: 12,
     *  ariaLabel: 'custom aria label'
     * }
     */
    defaultEdgeOptions?: DefaultEdgeOptions;
    /** Sets a fixed width for the flow */
    width?: number;
    /** Sets a fixed height for the flow */
    height?: number;
    /** Controls color scheme used for styling the flow
     * @default 'system'
     * @example 'system' | 'light' | 'dark'
     */
    colorMode?: ColorMode;
    /** Fallback color mode for SSR if colorMode is set to 'system' */
    colorModeSSR?: ColorModeClass;
    /** Class to be applied to the flow container */
    class?: string;
    /** Styles to be applied to the flow container */
    style?: string;
    /** Choose from the built-in edge types to be used for connections
     * @default 'default' | ConnectionLineType.Bezier
     * @example 'straight' | 'default' | 'step' | 'smoothstep' | 'bezier'
     * @example ConnectionLineType.Straight | ConnectionLineType.Default | ConnectionLineType.Step | ConnectionLineType.SmoothStep | ConnectionLineType.Bezier
     */
    connectionLineType?: ConnectionLineType;
    /** This callback can be used to validate a new connection
     *
     * If you return false, the edge will not be added to your flow.
     * If you have custom connection logic its preferred to use this callback over the isValidConnection prop on the handle component for performance reasons.
     * @default (connection: Connection) => true
     */
    isValidConnection?: IsValidConnection;
    /** This event handler is called when the user begins to pan or zoom the viewport */
    onMoveStart?: OnMoveStart;
    /** This event handler is called when the user pans or zooms the viewport */
    onMove?: OnMove;
    /** This event handler is called when the user stops panning or zooming the viewport */
    onMoveEnd?: OnMoveEnd;
    /** Ocassionally something may happen that causes Svelte Flow to throw an error.
     *
     * Instead of exploding your application, we log a message to the console and then call this event handler.
     * You might use it for additional logging or to show a message to the user.
     */
    onerror?: OnError;
    /** This handler gets called when the user deletes nodes or edges.
     * @example
     * onDelete={({nodes, edges}) => {
     *  console.log('deleted nodes:', nodes);
     *  console.log('deleted edges:', edges);
     * }}
     */
    ondelete?: OnDelete;
    /** This handler gets called before the user deletes nodes or edges and provides a way to abort the deletion by returning false. */
    onbeforedelete?: OnBeforeDelete;

    /** This handler gets called when a new edge is created. You can use it to modify the newly created edge. */
    onedgecreate?: OnEdgeCreate;

    /** This event gets fired when a connection successfully completes and an edge is created. */
    onconnect?: OnConnect;
    /** When a user starts to drag a connection line, this event gets fired. */
    onconnectstart?: OnConnectStart;
    /** When a user stops dragging a connection line, this event gets fired. */
    onconnectend?: OnConnectEnd;
    /** This handler gets called when the flow is finished initializing */
    oninit?: () => void;
  };
