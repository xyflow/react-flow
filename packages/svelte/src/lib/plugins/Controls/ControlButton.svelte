<script lang="ts">
  import cc from 'classcat';

  import type { ControlButtonProps } from './types';

  let {
    class: className,
    bgColor,
    bgColorHover,
    color,
    colorHover,
    borderColor,
    onclick,
    children,
    ...restProps
  }: ControlButtonProps = $props();
</script>

<button
  type="button"
  {onclick}
  class={cc(['svelte-flow__controls-button', className])}
  style:--xy-controls-button-background-color-props={bgColor}
  style:--xy-controls-button-background-color-hover-props={bgColorHover}
  style:--xy-controls-button-color-props={color}
  style:--xy-controls-button-color-hover-props={colorHover}
  style:--xy-controls-button-border-color-props={borderColor}
  {...restProps}
>
  {@render children?.()}
</button>
