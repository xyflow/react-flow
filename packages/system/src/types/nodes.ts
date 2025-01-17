import type { XYPosition, Position, CoordinateExtent, Handle } from '.';
import { Optional } from '../utils/types';

/**
 * Framework independent node data structure.
 *
 * @typeParam NodeData - type of the node data
 * @typeParam NodeType - type of the node
 */
export type NodeBase<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  NodeType extends string | undefined = string | undefined
> = {
  /** Unique id of a node */
  id: string;
  /** Position of a node on the pane
   * @example { x: 0, y: 0 }
   */
  position: XYPosition;
  /** Arbitrary data passed to a node */
  data: NodeData;
  /** Only relevant for default, source, target nodeType. controls source position
   * @example 'right', 'left', 'top', 'bottom'
   */
  sourcePosition?: Position;
  /** Only relevant for default, source, target nodeType. controls target position
   * @example 'right', 'left', 'top', 'bottom'
   */
  targetPosition?: Position;
  hidden?: boolean;
  selected?: boolean;
  /** True, if node is being dragged */
  dragging?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  deletable?: boolean;
  dragHandle?: string;
  width?: number;
  height?: number;
  initialWidth?: number;
  initialHeight?: number;
  /** Parent node id, used for creating sub-flows */
  parentId?: string;
  zIndex?: number;
  /** Boundary a node can be moved in
   * @example 'parent' or [[0, 0], [100, 100]]
   */
  extent?: 'parent' | CoordinateExtent;
  expandParent?: boolean;
  ariaLabel?: string;
  /** Origin of the node relative to it's position
   * @example
   * [0.5, 0.5] // centers the node
   * [0, 0] // top left
   * [1, 1] // bottom right
   */
  origin?: NodeOrigin;
  handles?: NodeHandle[];
  measured?: {
    width?: number;
    height?: number;
  };
} & (undefined extends NodeType
  ? {
      /** Type of node defined in nodeTypes */
      type?: string | undefined;
    }
  : {
      /** Type of node defined in nodeTypes */
      type: NodeType;
    });

export type InternalNodeBase<NodeType extends NodeBase = NodeBase> = NodeType & {
  measured: {
    width?: number;
    height?: number;
  };
  internals: {
    positionAbsolute: XYPosition;
    z: number;
    /** Holds a reference to the original node object provided by the user.
     * Used as an optimization to avoid certain operations. */
    userNode: NodeType;
    handleBounds?: NodeHandleBounds;
    bounds?: NodeBounds;
  };
};

/**
 * The node data structure that gets used for the nodes prop.
 *
 * @public
 */
export type NodeProps<NodeType extends NodeBase> = Pick<
  NodeType,
  | 'id'
  | 'data'
  | 'width'
  | 'height'
  | 'sourcePosition'
  | 'targetPosition'
  | 'selected'
  | 'dragHandle'
  | 'selectable'
  | 'deletable'
  | 'draggable'
  | 'parentId'
> &
  Required<Pick<NodeType, 'type' | 'dragging' | 'zIndex'>> & {
    /** whether a node is connectable or not */
    isConnectable: boolean;
    /** position absolute x value */
    positionAbsoluteX: number;
    /** position absolute x value */
    positionAbsoluteY: number;
  };

export type NodeHandleBounds = {
  source: Handle[] | null;
  target: Handle[] | null;
};

export type InternalNodeUpdate = {
  id: string;
  nodeElement: HTMLDivElement;
  force?: boolean;
};

export type NodeBounds = XYPosition & {
  width: number | null;
  height: number | null;
};

export type NodeDragItem = {
  id: string;
  position: XYPosition;
  // distance from the mouse cursor to the node when start dragging
  distance: XYPosition;
  measured: {
    width: number;
    height: number;
  };
  internals: {
    positionAbsolute: XYPosition;
  };
  extent?: 'parent' | CoordinateExtent;
  parentId?: string;
  dragging?: boolean;
  origin?: NodeOrigin;
  expandParent?: boolean;
};

export type NodeOrigin = [number, number];

export type OnSelectionDrag = (event: MouseEvent, nodes: NodeBase[]) => void;

export type NodeHandle = Omit<Optional<Handle, 'width' | 'height'>, 'nodeId'>;

export type Align = 'center' | 'start' | 'end';

export type NodeLookup<NodeType extends InternalNodeBase = InternalNodeBase> = Map<string, NodeType>;
export type ParentLookup<NodeType extends InternalNodeBase = InternalNodeBase> = Map<string, Map<string, NodeType>>;
