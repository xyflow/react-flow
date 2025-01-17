import type { CSSProperties, HTMLAttributes, MouseEvent as ReactMouseEvent, WheelEvent } from 'react';
import type {
  ConnectionMode,
  ConnectionLineType,
  OnConnect,
  OnConnectStart,
  OnConnectEnd,
  CoordinateExtent,
  KeyCode,
  PanOnScrollMode,
  ProOptions,
  PanelPosition,
  OnMove,
  OnMoveStart,
  OnMoveEnd,
  Viewport,
  NodeOrigin,
  HandleType,
  SelectionMode,
  OnError,
  ColorMode,
  SnapGrid,
} from '@xyflow/system';

import type {
  OnSelectionChangeFunc,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  ConnectionLineComponent,
  OnReconnect,
  OnInit,
  DefaultEdgeOptions,
  FitViewOptions,
  OnNodesDelete,
  OnEdgesDelete,
  OnDelete,
  OnNodesChange,
  OnEdgesChange,
  NodeMouseHandler,
  SelectionDragHandler,
  EdgeMouseHandler,
  OnNodeDrag,
  OnBeforeDelete,
  IsValidConnection,
} from '.';

/**
 * ReactFlow component props.
 * @public
 */
export interface ReactFlowProps<NodeType extends Node = Node, EdgeType extends Edge = Edge>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onError'> {
  /** An array of nodes to render in a controlled flow.
   * @example
   * const nodes = [
   *  {
   *    id: 'node-1',
   *    type: 'input',
   *    data: { label: 'Node 1' },
   *    position: { x: 250, y: 50 }
   *  }
   * ];
   */
  nodes?: NodeType[];
  /** An array of edges to render in a controlled flow.
   * @example
   * const edges = [
   *  {
   *    id: 'edge-1-2',
   *    source: 'node-1',
   *    target: 'node-2',
   *  }
   * ];
   */
  edges?: EdgeType[];
  /** The initial nodes to render in an uncontrolled flow. */
  defaultNodes?: NodeType[];
  /** The initial edges to render in an uncontrolled flow. */
  defaultEdges?: EdgeType[];
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
  /** This event handler is called when a user clicks on a node */
  onNodeClick?: NodeMouseHandler<NodeType>;
  /** This event handler is called when a user double clicks on a node */
  onNodeDoubleClick?: NodeMouseHandler<NodeType>;
  /** This event handler is called when mouse of a user enters a node */
  onNodeMouseEnter?: NodeMouseHandler<NodeType>;
  /** This event handler is called when mouse of a user moves over a node */
  onNodeMouseMove?: NodeMouseHandler<NodeType>;
  /** This event handler is called when mouse of a user leaves a node */
  onNodeMouseLeave?: NodeMouseHandler<NodeType>;
  /** This event handler is called when a user right clicks on a node */
  onNodeContextMenu?: NodeMouseHandler<NodeType>;
  /** This event handler is called when a user starts to drag a node */
  onNodeDragStart?: OnNodeDrag<NodeType>;
  /** This event handler is called when a user drags a node */
  onNodeDrag?: OnNodeDrag<NodeType>;
  /** This event handler is called when a user stops dragging a node */
  onNodeDragStop?: OnNodeDrag<NodeType>;
  /** This event handler is called when a user clicks on an edge */
  onEdgeClick?: (event: ReactMouseEvent, edge: EdgeType) => void;
  /** This event handler is called when a user right clicks on an edge */
  onEdgeContextMenu?: EdgeMouseHandler<EdgeType>;
  /** This event handler is called when mouse of a user enters an edge */
  onEdgeMouseEnter?: EdgeMouseHandler<EdgeType>;
  /** This event handler is called when mouse of a user moves over an edge */
  onEdgeMouseMove?: EdgeMouseHandler<EdgeType>;
  /** This event handler is called when mouse of a user leaves an edge */
  onEdgeMouseLeave?: EdgeMouseHandler<EdgeType>;
  /** This event handler is called when a user double clicks on an edge */
  onEdgeDoubleClick?: EdgeMouseHandler<EdgeType>;
  onReconnect?: OnReconnect<EdgeType>;
  onReconnectStart?: (event: ReactMouseEvent, edge: EdgeType, handleType: HandleType) => void;
  onReconnectEnd?: (event: MouseEvent | TouchEvent, edge: EdgeType, handleType: HandleType) => void;
  /** This event handler is called when a Node is updated
   * @example // Use NodesState hook to create edges and get onNodesChange handler
   * import ReactFlow, { useNodesState } from '@xyflow/react';
   * const [edges, setNodes, onNodesChange] = useNodesState(initialNodes);
   *
   * return (<ReactFlow onNodeChange={onNodeChange} {...rest} />)
   * @example // Use helper function to update edge
   * import ReactFlow, { applyNodeChanges } from '@xyflow/react';
   *
   * const onNodeChange = useCallback(
   *  (changes) => setNode((eds) => applyNodeChanges(changes, eds)),
   *  [],
   * );
   *
   * return (<ReactFlow onNodeChange={onNodeChange} {...rest} />)
   */
  onNodesChange?: OnNodesChange<NodeType>;
  /** This event handler is called when a Edge is updated
   * @example // Use EdgesState hook to create edges and get onEdgesChange handler
   * import ReactFlow, { useEdgesState } from '@xyflow/react';
   * const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
   *
   * return (<ReactFlow onEdgesChange={onEdgesChange} {...rest} />)
   * @example // Use helper function to update edge
   * import ReactFlow, { applyEdgeChanges } from '@xyflow/react';
   *
   * const onEdgesChange = useCallback(
   *  (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
   *  [],
   * );
   *
   * return (<ReactFlow onEdgesChange={onEdgesChange} {...rest} />)
   */
  onEdgesChange?: OnEdgesChange<EdgeType>;
  /** This event handler gets called when a Node is deleted */
  onNodesDelete?: OnNodesDelete<NodeType>;
  /** This event handler gets called when a Edge is deleted */
  onEdgesDelete?: OnEdgesDelete<EdgeType>;
  /** This event handler gets called when a Node or Edge is deleted */
  onDelete?: OnDelete<NodeType, EdgeType>;
  /** This event handler gets called when a user starts to drag a selection box */
  onSelectionDragStart?: SelectionDragHandler<NodeType>;
  /** This event handler gets called when a user drags a selection box */
  onSelectionDrag?: SelectionDragHandler<NodeType>;
  /** This event handler gets called when a user stops dragging a selection box */
  onSelectionDragStop?: SelectionDragHandler<NodeType>;
  onSelectionStart?: (event: ReactMouseEvent) => void;
  onSelectionEnd?: (event: ReactMouseEvent) => void;
  onSelectionContextMenu?: (event: ReactMouseEvent, nodes: NodeType[]) => void;
  /** When a connection line is completed and two nodes are connected by the user, this event fires with the new connection.
   *
   * You can use the addEdge utility to convert the connection to a complete edge.
   * @example // Use helper function to update edges onConnect
   * import ReactFlow, { addEdge } from '@xyflow/react';
   *
   * const onConnect = useCallback(
   *  (params) => setEdges((eds) => addEdge(params, eds)),
   *  [],
   * );
   *
   * return (<ReactFlow onConnect={onConnect} {...rest} />)
   */
  onConnect?: OnConnect;
  /** This event handler gets called when a user starts to drag a connection line */
  onConnectStart?: OnConnectStart;
  /** This event handler gets called when a user stops dragging a connection line */
  onConnectEnd?: OnConnectEnd;
  onClickConnectStart?: OnConnectStart;
  onClickConnectEnd?: OnConnectEnd;
  /** This event handler gets called when a flow has finished initializing */
  onInit?: OnInit<NodeType, EdgeType>;
  /** This event handler is called while the user is either panning or zooming the viewport. */
  onMove?: OnMove;
  /** This event handler gets called when a user starts to pan or zoom the viewport */
  onMoveStart?: OnMoveStart;
  /** This event handler gets called when a user stops panning or zooming the viewport */
  onMoveEnd?: OnMoveEnd;
  /** This event handler gets called when a user changes group of selected elements in the flow */
  onSelectionChange?: OnSelectionChangeFunc;
  /** This event handler gets called when user scroll inside the pane */
  onPaneScroll?: (event?: WheelEvent) => void;
  /** This event handler gets called when user clicks inside the pane */
  onPaneClick?: (event: ReactMouseEvent) => void;
  /** This event handler gets called when user right clicks inside the pane */
  onPaneContextMenu?: (event: ReactMouseEvent | MouseEvent) => void;
  /** This event handler gets called when mouse enters the pane */
  onPaneMouseEnter?: (event: ReactMouseEvent) => void;
  /** This event handler gets called when mouse moves over the pane */
  onPaneMouseMove?: (event: ReactMouseEvent) => void;
  /** This event handler gets called when mouse leaves the pane */
  onPaneMouseLeave?: (event: ReactMouseEvent) => void;
  /** Distance that the mouse can move between mousedown/up that will trigger a click
   * @default 0
   */
  paneClickDistance?: number;
  /** Distance that the mouse can move between mousedown/up that will trigger a click
   * @default 0
   */
  nodeClickDistance?: number;
  /** This handler gets called before the user deletes nodes or edges and provides a way to abort the deletion by returning false. */
  onBeforeDelete?: OnBeforeDelete<NodeType, EdgeType>;
  /** Custom node types to be available in a flow.
   *
   * React Flow matches a node's type to a component in the nodeTypes object.
   * @example
   * import CustomNode from './CustomNode';
   *
   * const nodeTypes = { nameOfNodeType: CustomNode };
   */
  nodeTypes?: NodeTypes;
  /** Custom edge types to be available in a flow.
   *
   * React Flow matches an edge's type to a component in the edgeTypes object.
   * @example
   * import CustomEdge from './CustomEdge';
   *
   * const edgeTypes = { nameOfEdgeType: CustomEdge };
   */
  edgeTypes?: EdgeTypes;
  /** The type of edge path to use for connection lines.
   *
   * Although created edges can be of any type, React Flow needs to know what type of path to render for the connection line before the edge is created!
   */
  connectionLineType?: ConnectionLineType;
  /** Styles to be applied to the connection line */
  connectionLineStyle?: CSSProperties;
  /** React Component to be used as a connection line */
  connectionLineComponent?: ConnectionLineComponent<NodeType>;
  /** Styles to be applied to the container of the connection line */
  connectionLineContainerStyle?: CSSProperties;
  /** 'strict' connection mode will only allow you to connect source handles to target handles.
   *
   * 'loose' connection mode will allow you to connect handles of any type to one another.
   * @default 'strict'
   */
  connectionMode?: ConnectionMode;
  /** Pressing down this key deletes all selected nodes & edges.
   * @default 'Backspace'
   */
  deleteKeyCode?: KeyCode | null;
  /** If a key is set, you can pan the viewport while that key is held down even if panOnScroll is set to false.
   *
   * By setting this prop to null you can disable this functionality.
   * @default 'Space'
   */
  selectionKeyCode?: KeyCode | null;
  /** Select multiple elements with a selection box, without pressing down selectionKey */
  selectionOnDrag?: boolean;
  /** When set to "partial", when the user creates a selection box by click and dragging nodes that are only partially in the box are still selected.
   * @default 'full'
   */
  selectionMode?: SelectionMode;
  /** If a key is set, you can pan the viewport while that key is held down even if panOnScroll is set to false.
   *
   * By setting this prop to null you can disable this functionality.
   * @default 'Space'
   */
  panActivationKeyCode?: KeyCode | null;
  /** Pressing down this key you can select multiple elements by clicking.
   * @default 'Meta' for macOS, "Ctrl" for other systems
   */
  multiSelectionKeyCode?: KeyCode | null;
  /** If a key is set, you can zoom the viewport while that key is held down even if panOnScroll is set to false.
   *
   * By setting this prop to null you can disable this functionality.
   * @default 'Meta' for macOS, "Ctrl" for other systems
   * */
  zoomActivationKeyCode?: KeyCode | null;
  /** Set this prop to make the flow snap to the grid */
  snapToGrid?: boolean;
  /** Grid all nodes will snap to
   * @example [20, 20]
   */
  snapGrid?: SnapGrid;
  /** You can enable this optimisation to instruct Svelte Flow to only render nodes and edges that would be visible in the viewport.
   *
   * This might improve performance when you have a large number of nodes and edges but also adds an overhead.
   * @default false
   */
  onlyRenderVisibleElements?: boolean;
  /** Controls if all nodes should be draggable
   * @default true
   */
  nodesDraggable?: boolean;
  /** Controls if all nodes should be connectable to each other
   * @default true
   */
  nodesConnectable?: boolean;
  /** Controls if all nodes should be focusable
   * @default true
   */
  nodesFocusable?: boolean;
  /** Defines nodes relative position to its coordinates
   * @example
   * [0, 0] // default, top left
   * [0.5, 0.5] // center
   * [1, 1] // bottom right
   */
  nodeOrigin?: NodeOrigin;
  /** Controls if all edges should be focusable
   * @default true
   */
  edgesFocusable?: boolean;
  /** Controls if all edges should be updateable
   * @default true
   */
  edgesReconnectable?: boolean;
  /** Controls if all elements should (nodes & edges) be selectable
   * @default true
   */
  elementsSelectable?: boolean;
  /** If true, nodes get selected on drag
   * @default true
   */
  selectNodesOnDrag?: boolean;
  /** Enableing this prop allows users to pan the viewport by clicking and dragging.
   *
   * You can also set this prop to an array of numbers to limit which mouse buttons can activate panning.
   * @example [0, 2] // allows panning with the left and right mouse buttons
   * [0, 1, 2, 3, 4] // allows panning with all mouse buttons
   */
  panOnDrag?: boolean | number[];
  /** Minimum zoom level
   * @default 0.5
   */
  minZoom?: number;
  /** Maximum zoom level
   * @default 2
   */
  maxZoom?: number;
  /** Controlled viewport to be used instead of internal one */
  viewport?: Viewport;
  /** Sets the initial position and zoom of the viewport.
   *
   * If a default viewport is provided but fitView is enabled, the default viewport will be ignored.
   * @example
   * const initialViewport = {
   *  zoom: 0.5,
   *  position: { x: 0, y: 0 }
   * };
   */
  defaultViewport?: Viewport;
  /**
   * Gets called when the viewport changes.
   */
  onViewportChange?: (viewport: Viewport) => void;
  /** By default the viewport extends infinitely. You can use this prop to set a boundary.
   *
   * The first pair of coordinates is the top left boundary and the second pair is the bottom right.
   * @example [[-1000, -10000], [1000, 1000]]
   */
  translateExtent?: CoordinateExtent;
  /** Disabling this prop will allow the user to scroll the page even when their pointer is over the flow.
   * @default true
   */
  preventScrolling?: boolean;
  /** By default nodes can be placed on an infinite flow. You can use this prop to set a boundary.
   *
   * The first pair of coordinates is the top left boundary and the second pair is the bottom right.
   * @example [[-1000, -10000], [1000, 1000]]
   */
  nodeExtent?: CoordinateExtent;
  /** Color of edge markers
   * @example "#b1b1b7"
   */
  defaultMarkerColor?: string;
  /** Controls if the viewport should zoom by scrolling inside the container */
  zoomOnScroll?: boolean;
  /** Controls if the viewport should zoom by pinching on a touch screen */
  zoomOnPinch?: boolean;
  /** Controls if the viewport should pan by scrolling inside the container
   *
   * Can be limited to a specific direction with panOnScrollMode
   */
  panOnScroll?: boolean;
  /** Controls how fast viewport should be panned on scroll.
   *
   * Use togther with panOnScroll prop.
   */
  panOnScrollSpeed?: number;
  /** This prop is used to limit the direction of panning when panOnScroll is enabled.
   *
   * The "free" option allows panning in any direction.
   * @default "free"
   * @example "horizontal" | "vertical"
   */
  panOnScrollMode?: PanOnScrollMode;
  /** Controls if the viewport should zoom by double clicking somewhere on the flow */
  zoomOnDoubleClick?: boolean;
  reconnectRadius?: number;
  noDragClassName?: string;
  noWheelClassName?: string;
  noPanClassName?: string;
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
  /**The connectOnClick option lets you click or tap on a source handle to start a connection
   * and then click on a target handle to complete the connection.
   *
   * If you set this option to false, users will need to drag the connection line to the target
   * handle to create a connection.
   */
  connectOnClick?: boolean;
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
  /** Enabling this option will raise the z-index of nodes when they are selected.
   * @default true
   */
  elevateNodesOnSelect?: boolean;
  /** Enabling this option will raise the z-index of edges when they are selected.
   * @default true
   */
  elevateEdgesOnSelect?: boolean;
  /**
   * Can be set true if built-in keyboard controls should be disabled.
   * @default false
   */
  disableKeyboardA11y?: boolean;
  /** You can enable this prop to automatically pan the viewport while dragging a node.
   * @default true
   */
  autoPanOnNodeDrag?: boolean;
  /** You can enable this prop to automatically pan the viewport while dragging a node.
   * @default true
   */
  autoPanOnConnect?: boolean;
  /** The speed at which the viewport pans while dragging a node or a selection box.
   * @default 15
   */
  autoPanSpeed?: number;
  /** You can enable this prop to automatically pan the viewport while making a new connection.
   * @default true
   */
  connectionRadius?: number;
  /** Ocassionally something may happen that causes Svelte Flow to throw an error.
   *
   * Instead of exploding your application, we log a message to the console and then call this event handler.
   * You might use it for additional logging or to show a message to the user.
   */
  onError?: OnError;
  /** This callback can be used to validate a new connection
   *
   * If you return false, the edge will not be added to your flow.
   * If you have custom connection logic its preferred to use this callback over the isValidConnection prop on the handle component for performance reasons.
   * @default (connection: Connection) => true
   */
  isValidConnection?: IsValidConnection<EdgeType>;
  /** With a threshold greater than zero you can control the distinction between node drag and click events.
   *
   * If threshold equals 1, you need to drag the node 1 pixel before a drag event is fired.
   * @default 1
   */
  nodeDragThreshold?: number;
  /** Sets a fixed width for the flow */
  width?: number;
  /** Sets a fixed height for the flow */
  height?: number;
  /** Controls color scheme used for styling the flow
   * @default 'system'
   * @example 'system' | 'light' | 'dark'
   */
  colorMode?: ColorMode;
  /** If set true, some debug information will be logged to the console like which events are fired.
   *
   * @default undefined
   */
  debug?: boolean;
}
