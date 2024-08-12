/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Selection as D3Selection } from 'd3-selection';
import type { D3DragEvent, SubjectPosition } from 'd3-drag';
import type { ZoomBehavior } from 'd3-zoom';
// this is needed for the Selection type to include the transition function :/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Transition } from 'd3-transition';

import type { XYPosition, Rect, Position } from './utils';
import type { InternalNodeBase, NodeBase, NodeDragItem } from './nodes';
import type { Handle, HandleType } from './handles';
import { PanZoomInstance } from './panzoom';
import { EdgeBase } from '..';
import { XYError } from '../xyerror';

export type Project = (position: XYPosition) => XYPosition;

export type OnMove = (event: MouseEvent | TouchEvent | null, viewport: Viewport) => void;
export type OnMoveStart = OnMove;
export type OnMoveEnd = OnMove;

export type ZoomInOut = (options?: ViewportHelperFunctionOptions) => Promise<boolean>;
export type ZoomTo = (zoomLevel: number, options?: ViewportHelperFunctionOptions) => Promise<boolean>;
export type GetZoom = () => number;
export type GetViewport = () => Viewport;
export type SetViewport = (viewport: Viewport, options?: ViewportHelperFunctionOptions) => Promise<boolean>;
export type SetCenter = (x: number, y: number, options?: SetCenterOptions) => Promise<boolean>;
export type FitBounds = (bounds: Rect, options?: FitBoundsOptions) => Promise<boolean>;

export type Connection = {
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
};

export type HandleConnection = Connection & {
  edgeId: string;
};

export enum ConnectionMode {
  Strict = 'strict',
  Loose = 'loose',
}

export type OnConnectStartParams = {
  nodeId: string | null;
  handleId: string | null;
  handleType: HandleType | null;
};

export type OnConnectStart = (event: MouseEvent | TouchEvent, params: OnConnectStartParams) => void;
export type OnConnect = (connection: Connection) => void;
export type OnConnectEnd = (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => void;

export type IsValidConnection = (edge: EdgeBase | Connection) => boolean;

export type FitViewParamsBase<NodeType extends NodeBase> = {
  nodes: Map<string, InternalNodeBase<NodeType>>;
  width: number;
  height: number;
  panZoom: PanZoomInstance;
  minZoom: number;
  maxZoom: number;
};

export type FitViewOptionsBase<NodeType extends NodeBase = NodeBase> = {
  padding?: number;
  includeHiddenNodes?: boolean;
  minZoom?: number;
  maxZoom?: number;
  duration?: number;
  nodes?: (NodeType | { id: string })[];
};

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

export type KeyCode = string | Array<string>;

export type SnapGrid = [number, number];

export enum PanOnScrollMode {
  Free = 'free',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export type ViewportHelperFunctionOptions = {
  duration?: number;
};

export type SetCenterOptions = ViewportHelperFunctionOptions & {
  zoom?: number;
};

export type FitBoundsOptions = ViewportHelperFunctionOptions & {
  padding?: number;
};

export type OnViewportChange = (viewport: Viewport) => void;

export type D3ZoomInstance = ZoomBehavior<Element, unknown>;
export type D3SelectionInstance = D3Selection<Element, unknown, null, undefined>;
export type D3ZoomHandler = (this: Element, event: any, d: unknown) => void;

export type UpdateNodeInternals = (nodeId: string | string[]) => void;

export type PanelPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type ProOptions = {
  account?: string;
  hideAttribution: boolean;
};

export type UseDragEvent = D3DragEvent<HTMLDivElement, null, SubjectPosition>;

export enum SelectionMode {
  Partial = 'partial',
  Full = 'full',
}

export type SelectionRect = Rect & {
  startX: number;
  startY: number;
};

// todo: remove first two arguments and only pass the error to the callback
export type OnError = (id: string, message: string, error: XYError) => void;

export type UpdateNodePositions = (dragItems: Map<string, NodeDragItem | InternalNodeBase>, dragging?: boolean) => void;
export type PanBy = (delta: XYPosition) => Promise<boolean>;

export const initialConnection: NoConnection = {
  inProgress: false,
  isValid: null,
  from: null,
  fromHandle: null,
  fromPosition: null,
  fromNode: null,
  to: null,
  toHandle: null,
  toPosition: null,
  toNode: null,
};

export type NoConnection = {
  inProgress: false;
  isValid: null;
  from: null;
  fromHandle: null;
  fromPosition: null;
  fromNode: null;
  to: null;
  toHandle: null;
  toPosition: null;
  toNode: null;
};
export type ConnectionInProgress<NodeType extends InternalNodeBase = InternalNodeBase> = {
  inProgress: true;
  isValid: boolean | null;
  from: XYPosition;
  fromHandle: Handle;
  fromPosition: Position;
  fromNode: NodeType;
  to: XYPosition;
  toHandle: Handle | null;
  toPosition: Position;
  toNode: NodeType | null;
};
export type ConnectionState<NodeType extends InternalNodeBase = InternalNodeBase> =
  | ConnectionInProgress<NodeType>
  | NoConnection;

export type FinalConnectionState<NodeType extends InternalNodeBase = InternalNodeBase> = Omit<
  ConnectionState<NodeType>,
  'inProgress'
>;

export type UpdateConnection<NodeType extends InternalNodeBase = InternalNodeBase> = (
  params: ConnectionState<NodeType>
) => void;

export type ColorModeClass = 'light' | 'dark';
export type ColorMode = ColorModeClass | 'system';

export type ConnectionLookup = Map<string, Map<string, HandleConnection>>;

export type OnBeforeDeleteBase<NodeType extends NodeBase = NodeBase, EdgeType extends EdgeBase = EdgeBase> = ({
  nodes,
  edges,
}: {
  nodes: NodeType[];
  edges: EdgeType[];
}) => Promise<boolean | { nodes: NodeType[]; edges: EdgeType[] }>;
