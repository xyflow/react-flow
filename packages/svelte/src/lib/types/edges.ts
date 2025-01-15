import type { Component } from 'svelte';
import type {
  EdgeBase,
  BezierPathOptions,
  DefaultEdgeOptionsBase,
  EdgePosition,
  SmoothStepPathOptions,
  StepPathOptions
} from '@xyflow/system';

import type { Node } from '$lib/types';

/**
 * The Edge type is mainly used for the `edges` that get passed to the SvelteFlow component.
 */
export type Edge<
  EdgeData extends Record<string, unknown> = Record<string, unknown>,
  EdgeType extends string | undefined = string | undefined
> = EdgeBase<EdgeData, EdgeType> & {
  label?: string;
  labelStyle?: string;
  style?: string;
  class?: string;
};

export type BaseEdgeProps = Pick<
  EdgeProps,
  'interactionWidth' | 'label' | 'labelStyle' | 'style'
> & {
  id?: string;
  /** SVG path of the edge */
  path: string;
  /** The x coordinate of the label */
  labelX?: number;
  /** The y coordinate of the label */
  labelY?: number;
  /** Marker at start of edge
   * @example 'url(#arrow)'
   */
  markerStart?: string;
  /** Marker at end of edge
   * @example 'url(#arrow)'
   */
  markerEnd?: string;
  class?: string;
};

type SmoothStepEdge<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<
  EdgeData,
  'smoothstep'
> & {
  pathOptions?: SmoothStepPathOptions;
};

type BezierEdge<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<
  EdgeData,
  'default'
> & {
  pathOptions?: BezierPathOptions;
};

type StepEdge<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<
  EdgeData,
  'step'
> & {
  pathOptions?: StepPathOptions;
};

type StraightEdge<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<
  EdgeData,
  'straight'
>;

export type BuiltInEdge = SmoothStepEdge | BezierEdge | StepEdge | StraightEdge;

/**
 * Custom edge component props.
 */
export type EdgeProps<EdgeType extends Edge = Edge> = Omit<
  EdgeType,
  'sourceHandle' | 'targetHandle'
> &
  EdgePosition & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    type: string;
    markerStart?: string;
    markerEnd?: string;
    sourceHandleId?: string | null;
    targetHandleId?: string | null;
  };

/**
 * Helper type for edge components that get exported by the library.
 */
export type EdgeComponentProps = EdgePosition & {
  id?: EdgeProps['id'];
  hidden?: EdgeProps['hidden'];
  deletable?: EdgeProps['deletable'];
  selectable?: EdgeProps['selectable'];
  markerStart?: EdgeProps['markerStart'];
  markerEnd?: EdgeProps['markerEnd'];
  zIndex?: EdgeProps['zIndex'];
  ariaLabel?: EdgeProps['ariaLabel'];
  interactionWidth?: EdgeProps['interactionWidth'];
  label?: EdgeProps['label'];
  labelStyle?: EdgeProps['labelStyle'];
  style?: EdgeProps['style'];
  class?: EdgeProps['class'];
};

export type EdgeComponentWithPathOptions<PathOptions> = EdgeComponentProps & {
  pathOptions?: PathOptions;
};

/**
 * BezierEdge component props
 */
export type BezierEdgeProps = EdgeComponentWithPathOptions<BezierPathOptions>;

/**
 * SmoothStepEdge component props
 */
export type SmoothStepEdgeProps = EdgeComponentWithPathOptions<SmoothStepPathOptions>;

/**
 * StepEdge component props
 */
export type StepEdgeProps = EdgeComponentWithPathOptions<StepPathOptions>;

/**
 * StraightEdge component props
 */
export type StraightEdgeProps = Omit<EdgeComponentProps, 'sourcePosition' | 'targetPosition'>;

export type EdgeTypes = Record<
  string,
  Component<
    EdgeProps & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: any;
    }
  >
>;

export type DefaultEdgeOptions = DefaultEdgeOptionsBase<Edge>;

export type EdgeLayouted = Pick<
  Edge,
  | 'type'
  | 'id'
  | 'data'
  | 'style'
  | 'source'
  | 'target'
  | 'animated'
  | 'selected'
  | 'selectable'
  | 'deletable'
  | 'label'
  | 'labelStyle'
  | 'interactionWidth'
  | 'markerStart'
  | 'markerEnd'
  | 'sourceHandle'
  | 'targetHandle'
  | 'ariaLabel'
  | 'hidden'
  | 'class'
  | 'zIndex'
> &
  EdgePosition & {
    sourceNode?: Node;
    targetNode?: Node;
    sourceHandleId?: string | null;
    targetHandleId?: string | null;
    edge: Edge;
  };
