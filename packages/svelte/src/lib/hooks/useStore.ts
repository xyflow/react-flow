import { getContext } from 'svelte';
import type { StoreContext, SvelteFlowStore } from '../store/types';

import { key } from '../store';
import { derivedWarning } from './derivedWarning.svelte';

export function useStore(): SvelteFlowStore {
  const storeContext = getContext<StoreContext>(key);

  if (!storeContext) {
    throw new Error(
      'In order to use useStore you need to wrap your component in a <SvelteFlowProvider />'
    );
  }

  if (process.env.NODE_ENV === 'development') {
    derivedWarning('useStore');
  }

  return storeContext.getStore();
}
