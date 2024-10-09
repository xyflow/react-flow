import {
  ConnectionMode,
  type Connection,
  type OnConnect,
  type OnConnectStart,
  type HandleType,
  type PanBy,
  type Transform,
  type Handle,
  type OnConnectEnd,
  type UpdateConnection,
  type IsValidConnection,
  NodeLookup,
  FinalConnectionState,
} from '../types';

export type OnPointerDownParams = {
  autoPanOnConnect: boolean;
  connectionMode: ConnectionMode;
  connectionRadius: number;
  domNode: HTMLDivElement | null;
  handleId: string | null;
  nodeId: string;
  isTarget: boolean;
  nodeLookup: NodeLookup;
  lib: string;
  flowId: string | null;
  edgeUpdaterType?: HandleType;
  updateConnection: UpdateConnection;
  panBy: PanBy;
  cancelConnection: () => void;
  onConnectStart?: OnConnectStart;
  onConnect?: OnConnect;
  onConnectEnd?: OnConnectEnd;
  isValidConnection?: IsValidConnection;
  onReconnectEnd?: (evt: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => void;
  getTransform: () => Transform;
  getFromHandle: () => Handle | null;
  autoPanSpeed?: number;
};

export type IsValidParams = {
  handle: Pick<Handle, 'nodeId' | 'id' | 'type'> | null;
  connectionMode: ConnectionMode;
  fromNodeId: string;
  fromHandleId: string | null;
  fromType: HandleType;
  isValidConnection?: IsValidConnection;
  doc: Document | ShadowRoot;
  lib: string;
  flowId: string | null;
  nodeLookup: NodeLookup;
};

export type XYHandleInstance = {
  onPointerDown: (event: MouseEvent | TouchEvent, params: OnPointerDownParams) => void;
  isValid: (event: MouseEvent | TouchEvent, params: IsValidParams) => Result;
};

export type Result = {
  handleDomNode: Element | null;
  isValid: boolean;
  connection: Connection | null;
  toHandle: Handle | null;
};
