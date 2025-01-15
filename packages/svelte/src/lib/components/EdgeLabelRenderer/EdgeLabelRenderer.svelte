<script lang="ts">
  import type { Snippet } from 'svelte';
  import portal from '$lib/actions/portal';
  import { useStore } from '$lib/store';

  const store = useStore();

  let { children }: { children?: Snippet } = $props();
</script>

<div use:portal={{ target: '.svelte-flow__edgelabel-renderer', domNode: store.domNode }}>
  {@render children?.()}
</div>
