import type { SvelteFlowStore } from '$lib/store/types';
import type { KeyDefinition } from '$lib/types';

export type KeyHandlerProps = {
  store: SvelteFlowStore;
  selectionKey?: KeyDefinition | KeyDefinition[] | null;
  multiSelectionKey?: KeyDefinition | KeyDefinition[] | null;
  deleteKey?: KeyDefinition | KeyDefinition[] | null;
  panActivationKey?: KeyDefinition | KeyDefinition[] | null;
  zoomActivationKey?: KeyDefinition | KeyDefinition[] | null;
};
