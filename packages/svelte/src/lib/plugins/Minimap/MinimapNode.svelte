<script lang="ts">
  import cc from 'classcat';

  let {
    x,
    y,
    width,
    height,
    borderRadius = 5,
    color,
    shapeRendering,
    strokeColor,
    strokeWidth = 2,
    selected,
    class: className
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
    color?: string;
    shapeRendering: string;
    strokeColor?: string;
    strokeWidth?: number;
    selected?: boolean;
    class?: string;
  } = $props();
</script>

<rect
  class={cc(['svelte-flow__minimap-node', className])}
  class:selected
  {x}
  {y}
  rx={borderRadius}
  ry={borderRadius}
  {width}
  {height}
  style={`${color ? `fill: ${color};` : ''}${strokeColor ? `stroke: ${strokeColor};` : ''}${
    strokeWidth ? `stroke-width: ${strokeWidth};` : ''
  }`}
  shape-rendering={shapeRendering}
/>
