import { useStore } from '$lib/store';

import type { ConnectionState } from '@xyflow/system';

/**
 * Hook for receiving the current connection.
 *
 * @public
 * @returns current connection as a readable store
 */
export function useConnection(): { current: ConnectionState } {
  const { connection } = $derived(useStore());

  return {
    get current() {
      return connection;
    }
  };
}
