import type { Position, Align } from '@xyflow/system';
import type { Snippet } from 'svelte';

export type NodeToolbarProps = {
  /** The id of the node, or array of ids the toolbar should be displayed at */
  nodeId?: string | string[];
  /** Position of the toolbar relative to the node
   * @example Position.TopLeft, Position.TopRight,
   * Position.BottomLeft, Position.BottomRight
   */
  position?: Position;
  /** Align the toolbar relative to the node
   * @example Align.Start, Align.Center, Align.End
   */
  align?: Align;
  /** Offset the toolbar from the node */
  offset?: number;
  /** If true, node toolbar is visible even if node is not selected */
  isVisible?: boolean;
  children?: Snippet;
};
