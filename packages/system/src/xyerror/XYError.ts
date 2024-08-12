import { HandleType } from '../types';

export enum XYErrorCode {
  ZUSTAND_STORE_NOT_PROVIDED = '001',
  NODE_EDGE_TYPES_OBJECT_RECREATED = '002',
  NODE_TYPE_NOT_FOUND = '003',
  MISSING_CONTAINER_DIMENSIONS = '004',
  NODE_EXTENT_INVALID = '005',
  EDGE_INVALID = '006',
  RECONNECT_EDGE = '007',
  EDGE_SOURCE_TARGET_HANDLE_NOT_FOUND = '008',
  MARKER_TYPE_NOT_FOUND = '009',
  HANDLE_NODE_ID_NOT_FOUND = '010',
  EDGE_TYPE_NOT_FOUND = '011',
  NODE_NOT_FOUND = '012',
  MISSING_STYLES = '013',
}

export const XYErrorMessages = {
  [XYErrorCode.ZUSTAND_STORE_NOT_PROVIDED]: () =>
    '[React Flow]: Seems like you have not used zustand provider as an ancestor. Help: https://reactflow.dev/error#001',
  [XYErrorCode.NODE_EDGE_TYPES_OBJECT_RECREATED]: () =>
    "It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",
  [XYErrorCode.NODE_TYPE_NOT_FOUND]: (nodeType: string) =>
    `Node type "${nodeType}" not found. Using fallback type "default".`,
  [XYErrorCode.MISSING_CONTAINER_DIMENSIONS]: () =>
    'The React Flow parent container needs a width and a height to render the graph.',
  [XYErrorCode.NODE_EXTENT_INVALID]: () => 'Only child nodes can use a parent extent.',
  [XYErrorCode.EDGE_INVALID]: () => "Can't create edge. An edge needs a source and a target.",
  [XYErrorCode.RECONNECT_EDGE]: (id: string) => `The old edge with id=${id} does not exist.`,
  [XYErrorCode.EDGE_SOURCE_TARGET_HANDLE_NOT_FOUND]: (
    handleType: HandleType,
    { id, sourceHandle, targetHandle }: { id: string; sourceHandle: string | null; targetHandle: string | null }
  ) =>
    `Couldn't create edge for ${handleType} handle id: "${
      handleType === 'source' ? sourceHandle : targetHandle
    }", edge id: ${id}.`,
  [XYErrorCode.MARKER_TYPE_NOT_FOUND]: (type: string) => `Marker type "${type}" doesn't exist.`,
  [XYErrorCode.HANDLE_NODE_ID_NOT_FOUND]: () =>
    'Handle: No node id found. Make sure to only use a Handle inside a custom Node.',
  [XYErrorCode.EDGE_TYPE_NOT_FOUND]: (edgeType: string) =>
    `Edge type "${edgeType}" not found. Using fallback type "default".`,
  [XYErrorCode.NODE_NOT_FOUND]: (id: string) =>
    `Node with id "${id}" does not exist, it may have been removed. This can happen when a node is deleted before the "onNodeClick" handler is called.`,
  [XYErrorCode.MISSING_STYLES]: (lib: string = 'react') =>
    `It seems that you haven't loaded the styles. Please import '@xyflow/${lib}/dist/style.css' or base.css to make sure everything is working properly.`,
} as const;

type ErrorArgs<T extends XYErrorCode> = Parameters<(typeof XYErrorMessages)[T]>;

export class XYError<T extends XYErrorCode = XYErrorCode, Args extends ErrorArgs<T> = ErrorArgs<T>> extends Error {
  name = 'XYError';
  code: T;
  args: Args;

  constructor(code: T, ...args: Args) {
    // @ts-expect-error - TS doesn't know that the args are a tuple type
    super(XYErrorMessages[code]?.(...args));
    this.code = code;
    this.args = args;
  }
}
