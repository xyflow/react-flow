<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  import { EdgeLabelRenderer } from '$lib/components/EdgeLabelRenderer';
  import { useStore } from '$lib/store';

  let {
    style,
    x,
    y,
    children
  }: {
    style?: string;
    x?: number;
    y?: number;
    children?: Snippet;
  } = $props();

  const store = useStore();

  const id = getContext<string>('svelteflow__edge_id');
</script>

<EdgeLabelRenderer>
  <div
    class="svelte-flow__edge-label"
    style:transform="translate(-50%, -50%) translate({x}px,{y}px)"
    style={'pointer-events: all;' + style}
    role="button"
    tabindex="-1"
    onkeyup={() => {}}
    onclick={() => {
      if (id) store.handleEdgeSelection(id);
    }}
  >
    {@render children?.()}
  </div>
</EdgeLabelRenderer>
