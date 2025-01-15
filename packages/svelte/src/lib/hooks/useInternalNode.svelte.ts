import { useStore } from '$lib/store';
import type { InternalNode } from '$lib/types';

/**
 * Hook to get an internal node by id.
 *
 * @public
 * @param id - the node id
 * @returns a readable with an internal node or undefined
 */
export function useInternalNode(id: string): { current: InternalNode | undefined } {
  const { nodeLookup, nodes } = $derived(useStore());

  const node = $derived.by(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    nodes;
    return nodeLookup.get(id);
  });

  return {
    get current() {
      return node;
    }
  };
}
