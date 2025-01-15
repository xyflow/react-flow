<script lang="ts">
  import { EdgeWrapper } from '$lib/components/EdgeWrapper';
  import { CallOnMount } from '$lib/components/CallOnMount';
  import { MarkerDefinition } from '$lib/container/EdgeRenderer/MarkerDefinition';
  import type { EdgeEvents } from '$lib/types';
  import type { SvelteFlowStore } from '$lib/store/types';

  let {
    store,
    onedgeclick,
    onedgecontextmenu,
    onedgemouseenter,
    onedgemouseleave
  }: { store: SvelteFlowStore } & EdgeEvents = $props();
</script>

<div class="svelte-flow__edges">
  <svg class="svelte-flow__marker">
    <MarkerDefinition />
  </svg>

  {#each store.visible.edges.values() as edge (edge.id)}
    <EdgeWrapper
      {store}
      {edge}
      {onedgeclick}
      {onedgecontextmenu}
      {onedgemouseenter}
      {onedgemouseleave}
    />
  {/each}

  {#if !store.edgesInitialized && store.visible.edges.size > 0}
    <CallOnMount
      onMount={() => {
        store.edgesInitialized = true;
      }}
      onDestroy={() => {
        // TODO: this needs to be handled differently
        // store.edgesInitialized = false;
      }}
    />
  {/if}
</div>
