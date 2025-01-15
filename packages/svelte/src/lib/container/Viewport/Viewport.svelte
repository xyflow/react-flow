<script lang="ts">
  import type { SvelteFlowStore } from '$lib/store/types';
  import type { Snippet } from 'svelte';

  let { store, children }: { store: SvelteFlowStore; children: Snippet } = $props();
</script>

<div
  class="svelte-flow__viewport xyflow__viewport"
  style="transform: translate({store.viewport.x}px, {store.viewport.y}px) scale({store.viewport
    .zoom})"
>
  {@render children()}
</div>

<style>
  .svelte-flow__viewport {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
