import type { SvelteFlowStore } from '$lib/store/types';
import type { InternalNode } from '$lib/types';

export type ConnectableContext = {
  value: boolean;
};

export type NodeWrapperProps = {
  node: InternalNode;
  store: SvelteFlowStore;
  nodeClickDistance?: number;
  resizeObserver?: ResizeObserver | null;
};
