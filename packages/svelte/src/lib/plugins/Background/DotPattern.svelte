<script lang="ts">
  import cc from 'classcat';

  let { radius, class: className }: { radius: number; class?: string } = $props();
</script>

<circle
  cx={radius}
  cy={radius}
  r={radius}
  class={cc(['svelte-flow__background-pattern', 'dots', className])}
/>
