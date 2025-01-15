import type { Snippet } from 'svelte';
import type { PaneEvents } from '$lib/types';
import type { SvelteFlowStore } from '$lib/store/types';

export type PaneProps = {
  store: SvelteFlowStore;
  panOnDrag?: boolean | number[];
  selectionOnDrag?: boolean;
  children: Snippet;
} & PaneEvents;
