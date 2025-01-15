<script lang="ts">
  import cc from 'classcat';
  import type { BackgroundVariant } from './types';

  let {
    lineWidth,
    dimensions,
    variant,
    class: className
  }: {
    lineWidth: number;
    dimensions: [number, number];
    variant: BackgroundVariant;
    class?: string;
  } = $props();
</script>

<path
  stroke-width={lineWidth}
  d={`M${dimensions[0] / 2} 0 V${dimensions[1]} M0 ${dimensions[1] / 2} H${dimensions[0]}`}
  class={cc(['svelte-flow__background-pattern', variant, className])}
/>
