import type { Snippet } from 'svelte';
import type { NodeOrigin } from '@xyflow/system';
import type { Edge, Node } from '$lib/types';

export type SvelteFlowProviderProps = {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  initialWidth?: number;
  initialHeight?: number;
  fitView?: boolean;
  nodeOrigin?: NodeOrigin;
  children?: Snippet;
};
