/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CSSProperties, HTMLAttributes, ReactNode, MouseEvent as ReactMouseEvent, ComponentType } from 'react';
import type {
  EdgeBase,
  BezierPathOptions,
  Position,
  SmoothStepPathOptions,
  DefaultEdgeOptionsBase,
  HandleType,
  Connection,
  ConnectionLineType,
  Handle,
  EdgePosition,
  StepPathOptions,
  OnError,
  FinalConnectionState,
} from '@xyflow/system';

import { EdgeTypes, InternalNode, Node } from '.';

export type EdgeLabelOptions = {
  label?: string | ReactNode;
  labelStyle?: CSSProperties;
  labelShowBg?: boolean;
  labelBgStyle?: CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
};

/**
 * The Edge type is mainly used for the `edges` that get passed to the ReactFlow component
 * @public
 */
export type Edge<
  EdgeData extends Record<string, unknown> = Record<string, unknown>,
  EdgeType extends string | undefined = string | undefined,
> = EdgeBase<EdgeData, EdgeType> &
  EdgeLabelOptions & {
    style?: CSSProperties;
    className?: string;
    reconnectable?: boolean | HandleType;
    focusable?: boolean;
  };

type SmoothStepEdge<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<
  EdgeData,
  'smoothstep'
> & {
  pathOptions?: SmoothStepPathOptions;
};

type BezierEdge<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<EdgeData, 'default'> & {
  pathOptions?: BezierPathOptions;
};

type StepEdge<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<EdgeData, 'step'> & {
  pathOptions?: StepPathOptions;
};

type StraightEdge<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<EdgeData, 'straight'>;

export type BuiltInEdge = SmoothStepEdge | BezierEdge | StepEdge | StraightEdge;

export type EdgeMouseHandler<EdgeType extends Edge = Edge> = (event: ReactMouseEvent, edge: EdgeType) => void;

export type EdgeWrapperProps<EdgeType extends Edge = Edge> = {
  id: string;
  edgesFocusable: boolean;
  edgesReconnectable: boolean;
  elementsSelectable: boolean;
  noPanClassName: string;
  onClick?: EdgeMouseHandler<EdgeType>;
  onDoubleClick?: EdgeMouseHandler<EdgeType>;
  onReconnect?: OnReconnect<EdgeType>;
  onContextMenu?: EdgeMouseHandler<EdgeType>;
  onMouseEnter?: EdgeMouseHandler<EdgeType>;
  onMouseMove?: EdgeMouseHandler<EdgeType>;
  onMouseLeave?: EdgeMouseHandler<EdgeType>;
  reconnectRadius?: number;
  onReconnectStart?: (event: ReactMouseEvent, edge: EdgeType, handleType: HandleType) => void;
  onReconnectEnd?: (
    event: MouseEvent | TouchEvent,
    edge: EdgeType,
    handleType: HandleType,
    connectionState: FinalConnectionState
  ) => void;
  rfId?: string;
  edgeTypes?: EdgeTypes;
  onError?: OnError;
  disableKeyboardA11y?: boolean;
};

export type DefaultEdgeOptions = DefaultEdgeOptionsBase<Edge>;

export type EdgeTextProps = HTMLAttributes<SVGElement> &
  EdgeLabelOptions & {
    x: number;
    y: number;
  };

/**
 * Custom edge component props
 * @public
 */
export type EdgeProps<EdgeType extends Edge = Edge> = Pick<
  EdgeType,
  'id' | 'animated' | 'data' | 'style' | 'selected' | 'source' | 'target' | 'selectable' | 'deletable'
> &
  EdgePosition &
  EdgeLabelOptions & {
    sourceHandleId?: string | null;
    targetHandleId?: string | null;
    markerStart?: string;
    markerEnd?: string;
    // @TODO: how can we get better types for pathOptions?
    pathOptions?: any;
    interactionWidth?: number;
  };

/**
 * BaseEdge component props
 * @public
 */
export type BaseEdgeProps = EdgeLabelOptions & {
  /** Unique id of edge */
  id?: string;
  /** Additional padding where interacting with an edge is still possible */
  interactionWidth?: number;
  className?: string;
  /** The x position of edge label */
  labelX?: number;
  /** The y position of edge label */
  labelY?: number;
  /** Marker at start of edge
   * @example 'url(#arrow)'
   */
  markerStart?: string;
  /** Marker at end of edge
   * @example 'url(#arrow)'
   */
  markerEnd?: string;
  /** SVG path of the edge */
  path: string;
  style?: CSSProperties;
};

/**
 * Helper type for edge components that get exported by the library
 * @public
 */
export type EdgeComponentProps = EdgePosition &
  EdgeLabelOptions & {
    id?: EdgeProps['id'];
    markerStart?: EdgeProps['markerStart'];
    markerEnd?: EdgeProps['markerEnd'];
    interactionWidth?: EdgeProps['interactionWidth'];
    style?: EdgeProps['style'];
    sourceHandleId?: EdgeProps['sourceHandleId'];
    targetHandleId?: EdgeProps['targetHandleId'];
  };

export type EdgeComponentWithPathOptions<PathOptions> = EdgeComponentProps & {
  pathOptions?: PathOptions;
};

/**
 * BezierEdge component props
 * @public
 */
export type BezierEdgeProps = EdgeComponentWithPathOptions<BezierPathOptions>;

/**
 * SmoothStepEdge component props
 * @public
 */
export type SmoothStepEdgeProps = EdgeComponentWithPathOptions<SmoothStepPathOptions>;

/**
 * StepEdge component props
 * @public
 */
export type StepEdgeProps = EdgeComponentWithPathOptions<StepPathOptions>;

/**
 * StraightEdge component props
 * @public
 */
export type StraightEdgeProps = Omit<EdgeComponentProps, 'sourcePosition' | 'targetPosition'>;

/**
 * SimpleBezier component props
 * @public
 */
export type SimpleBezierEdgeProps = EdgeComponentProps;

export type OnReconnect<EdgeType extends Edge = Edge> = (oldEdge: EdgeType, newConnection: Connection) => void;

export type ConnectionLineComponentProps<NodeType extends Node = Node> = {
  connectionLineStyle?: CSSProperties;
  connectionLineType: ConnectionLineType;
  fromNode: InternalNode<NodeType>;
  fromHandle: Handle;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPosition: Position;
  toPosition: Position;
  connectionStatus: 'valid' | 'invalid' | null;
  toNode: InternalNode<NodeType> | null;
  toHandle: Handle | null;
};

export type ConnectionLineComponent<NodeType extends Node = Node> = ComponentType<
  ConnectionLineComponentProps<NodeType>
>;
