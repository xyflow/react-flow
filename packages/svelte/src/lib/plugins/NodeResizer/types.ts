import type {
  ControlPosition,
  ResizeControlVariant,
  ShouldResize,
  OnResizeStart,
  OnResize,
  OnResizeEnd
} from '@xyflow/system';
import type { Snippet } from 'svelte';

export type NodeResizerProps = {
  /** Id of the node it is resizing
   * @remarks optional if used inside custom node
   */
  nodeId?: string;
  /** Color of the resize handle */
  color?: string;
  /** Class applied to handle */
  handleClass?: string;
  /** Style applied to handle */
  handleStyle?: string;
  /** Class applied to line */
  lineClass?: string;
  /** Style applied to line */
  lineStyle?: string;
  /** Are the controls visible */
  isVisible?: boolean;
  /** Minimum width of node */
  minWidth?: number;
  /** Minimum height of node */
  minHeight?: number;
  /** Maximum width of node */
  maxWidth?: number;
  /** Maximum height of node */
  maxHeight?: number;
  /** Keep aspect ratio when resizing */
  keepAspectRatio?: boolean;
  /** Callback to determine if node should resize */
  shouldResize?: ShouldResize;
  /** Callback called when resizing starts */
  onResizeStart?: OnResizeStart;
  /** Callback called when resizing */
  onResize?: OnResize;
  /** Callback called when resizing ends */
  onResizeEnd?: OnResizeEnd;
};

export type ResizeControlProps = Pick<
  NodeResizerProps,
  | 'nodeId'
  | 'color'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | 'keepAspectRatio'
  | 'shouldResize'
  | 'onResizeStart'
  | 'onResize'
  | 'onResizeEnd'
> & {
  /** Position of control
   * @example ControlPosition.TopLeft, ControlPosition.TopRight,
   * ControlPosition.BottomLeft, ControlPosition.BottomRight
   */
  position?: ControlPosition;
  /** Variant of control
   * @example ResizeControlVariant.Handle, ResizeControlVariant.Line
   */
  variant?: ResizeControlVariant;
  class?: string;
  style?: string;
  children?: Snippet;
};
