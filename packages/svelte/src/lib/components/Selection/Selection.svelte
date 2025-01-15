<script lang="ts">
  let {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    isVisible = true
  }: {
    x?: number | null;
    y?: number | null;
    width?: number | string | null;
    height?: number | string | null;
    isVisible?: boolean;
  } = $props();
</script>

{#if isVisible}
  <div
    class="svelte-flow__selection"
    style:width={typeof width === 'string' ? width : `${width}px`}
    style:height={typeof height === 'string' ? height : `${height}px`}
    style:transform={`translate(${x}px, ${y}px)`}
  ></div>
{/if}

<style>
  .svelte-flow__selection {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
