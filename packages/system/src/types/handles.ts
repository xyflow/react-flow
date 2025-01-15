import type { Position, IsValidConnection } from '.';

export type HandleType = 'source' | 'target';

export type Handle = {
  id?: string | null;
  nodeId: string;
  x: number;
  y: number;
  position: Position;
  type: HandleType;
  width: number;
  height: number;
};

export type HandleProps = {
  /** Type of the handle
   * @example HandleType.Source, HandleType.Target
   */
  type: HandleType;
  /** Position of the handle
   * @example Position.TopLeft, Position.TopRight,
   * Position.BottomLeft, Position.BottomRight
   */
  position: Position;
  /** Should you be able to connect to/from this handle */
  isConnectable?: boolean;
  /** Should you be able to connect from this handle */
  isConnectableStart?: boolean;
  /** Should you be able to connect to this handle */
  isConnectableEnd?: boolean;
  /** Callback if connection is valid
   * @remarks connection becomes an edge if isValidConnection returns true
   */
  isValidConnection?: IsValidConnection;
  /** Id of the handle
   * @remarks optional if there is only one handle of this type
   */
  id?: string | null;
};
