<script lang="ts">
  import { Panel } from '$lib/container/Panel';
  import type { AttributionProps } from './types';

  let { proOptions, position = 'bottom-right' }: AttributionProps = $props();
</script>

{#if proOptions?.hideAttribution}
  <Panel
    {position}
    class="svelte-flow__attribution"
    data-message="Feel free to remove the attribution or check out how you could support us: https://svelteflow.dev/support-us"
  >
    <a
      href="https://svelteflow.dev"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Svelte Flow attribution"
    >
      Svelte Flow
    </a>
  </Panel>
{/if}
