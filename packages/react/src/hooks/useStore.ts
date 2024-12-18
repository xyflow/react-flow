import { useContext, useMemo } from 'react';
import { UseBoundStoreWithEqualityFn, useStoreWithEqualityFn as useZustandStore } from 'zustand/traditional';
import { StoreApi } from 'zustand';
import { XYErrorCode, XYErrorMessages } from '@xyflow/system';

import StoreContext from '../contexts/StoreContext';
import type { Edge, Node, ReactFlowState } from '../types';

const zustandErrorMessage = XYErrorMessages[XYErrorCode.ZUSTAND_STORE_NOT_PROVIDED]();

/**
 * Hook for accessing the internal store. Should only be used in rare cases.
 *
 * @public
 * @param selector
 * @param equalityFn
 * @returns The selected state slice
 *
 * @example
 * const nodes = useStore((state: ReactFlowState<MyNodeType>) => state.nodes);
 *
 */
function useStore<StateSlice = unknown>(
  selector: (state: ReactFlowState) => StateSlice,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean
) {
  const store = useContext(StoreContext);

  if (store === null) {
    throw new Error(zustandErrorMessage);
  }

  return useZustandStore(store, selector, equalityFn);
}

function useStoreApi<NodeType extends Node = Node, EdgeType extends Edge = Edge>() {
  const store = useContext(StoreContext) as UseBoundStoreWithEqualityFn<
    StoreApi<ReactFlowState<NodeType, EdgeType>>
  > | null;

  if (store === null) {
    throw new Error(zustandErrorMessage);
  }

  return useMemo(
    () => ({
      getState: store.getState,
      setState: store.setState,
      subscribe: store.subscribe,
    }),
    [store]
  );
}

export { useStore, useStoreApi };
