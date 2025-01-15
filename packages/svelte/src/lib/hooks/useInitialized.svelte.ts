import { useStore } from '$lib/store';

/**
 * Hook for seeing if nodes are initialized
 * @returns - reactive nodesInitialized
 */
export function useNodesInitialized() {
  const { nodesInitialized } = $derived(useStore());
  return {
    get current() {
      return nodesInitialized;
    }
  };
}

/**
 * Hook for seeing if the flow is initialized
 * @returns - reactive initialized
 */
export function useInitialized() {
  const { initialized } = $derived(useStore());
  return {
    get current() {
      return initialized;
    }
  };
}
