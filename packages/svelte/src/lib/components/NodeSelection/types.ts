import type { SvelteFlowStore } from '$lib/store/types';
import type { NodeEvents, NodeSelectionEvents } from '$lib/types';

export type NodeSelectionProps = { store: SvelteFlowStore } & NodeSelectionEvents &
  Pick<NodeEvents, 'onnodedrag' | 'onnodedragstart' | 'onnodedragstop'>;
