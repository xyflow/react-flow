<script lang="ts">
  import type { Snippet } from 'svelte';

  import portal from '$lib/actions/portal';
  import { useStore } from '$lib/store';

  let { children }: { children?: Snippet } = $props();

  const store = useStore();
</script>

<div use:portal={{ target: '.svelte-flow__viewport-portal', domNode: store.domNode }}>
  {@render children?.()}
</div>
