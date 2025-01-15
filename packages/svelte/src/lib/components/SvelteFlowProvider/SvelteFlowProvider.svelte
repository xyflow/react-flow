<script lang="ts">
  import { onDestroy, setContext } from 'svelte';

  import { createStore, key } from '$lib/store';
  import type { SvelteFlowProviderProps } from './types';
  import type { ProviderContext, SvelteFlowStore } from '$lib/store/types';

  let { children }: SvelteFlowProviderProps = $props();

  let store = $state.raw(createStore({ props: {}, nodes: [], edges: [] }));

  setContext(key, {
    provider: true,
    getStore() {
      return store;
    },
    setStore: (newStore: SvelteFlowStore) => {
      store = newStore;
    }
  } satisfies ProviderContext);

  onDestroy(() => {
    store.reset();
  });
</script>

{@render children?.()}
