import { key } from '$lib/store';
import type { StoreContext } from '$lib/store/types';
import { getContext } from 'svelte';

/**
 * Warns the user that they should use $derived() when calling a hook.
 * This is not neccessarry when the hook is called inside a child of <SvelteFlowFlow />,
 * however exceptions can be made if you don't want to return a closure.
 * @param functionName - The name of the function that is being called
 * @param force - If true, the warning will be shown regardless if child of <SvelteFlowFlow />
 */
export function derivedWarning(functionName: string) {
  const storeContext = getContext<StoreContext>(key);

  if (!storeContext) {
    throw new Error(
      `In order to use ${functionName}() you need to wrap your component in a <SvelteFlowProvider />`
    );
  }

  if (storeContext.provider && typeof window === 'object' && !$effect.tracking()) {
    console.warn(`Use $derived(${functionName}()) to receive updates when values change.`);
    console.trace(functionName);
  }
}
