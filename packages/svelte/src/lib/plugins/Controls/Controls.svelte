<script lang="ts">
  import cc from 'classcat';

  import Panel from '$lib/container/Panel/Panel.svelte';
  import { useStore } from '$lib/store';
  import ControlButton from './ControlButton.svelte';
  import PlusIcon from './Icons/Plus.svelte';
  import MinusIcon from './Icons/Minus.svelte';
  import FitViewIcon from './Icons/Fit.svelte';
  import LockIcon from './Icons/Lock.svelte';
  import UnlockIcon from './Icons/Unlock.svelte';

  import type { ControlsProps } from './types';

  let {
    position = 'bottom-left',
    orientation = 'vertical',
    showZoom = true,
    showFitView = true,
    showLock = true,
    style,
    class: className,
    buttonBgColor,
    buttonBgColorHover,
    buttonColor,
    buttonColorHover,
    buttonBorderColor,
    'aria-label': ariaLabel,
    fitViewOptions,
    children,
    before,
    after
  }: ControlsProps = $props();

  const store = useStore();

  const buttonProps = {
    bgColor: buttonBgColor,
    bgColorHover: buttonBgColorHover,
    color: buttonColor,
    colorHover: buttonColorHover,
    borderColor: buttonBorderColor
  };

  let isInteractive = $state(
    store.nodesDraggable || store.nodesConnectable || store.elementsSelectable
  );
  let minZoomReached = $derived(store.viewport.zoom <= store.minZoom);
  let maxZoomReached = $derived(store.viewport.zoom >= store.maxZoom);
  let orientationClass = $derived(orientation === 'horizontal' ? 'horizontal' : 'vertical');

  const onZoomInHandler = () => {
    store.zoomIn();
  };

  const onZoomOutHandler = () => {
    store.zoomOut();
  };

  const onFitViewHandler = () => {
    store.fitView(fitViewOptions);
  };

  const onToggleInteractivity = () => {
    isInteractive = !isInteractive;

    store.nodesDraggable = isInteractive;
    store.nodesConnectable = isInteractive;
    store.elementsSelectable = isInteractive;
  };
</script>

<Panel
  class={cc(['svelte-flow__controls', orientationClass, className])}
  {position}
  data-testid="svelte-flow__controls"
  aria-label={ariaLabel ?? 'Svelte Flow controls'}
  {style}
>
  {#if before}
    {@render before()}
  {/if}
  {#if showZoom}
    <ControlButton
      onclick={onZoomInHandler}
      class="svelte-flow__controls-zoomin"
      title="zoom in"
      aria-label="zoom in"
      disabled={maxZoomReached}
      {...buttonProps}
    >
      <PlusIcon />
    </ControlButton>
    <ControlButton
      onclick={onZoomOutHandler}
      class="svelte-flow__controls-zoomout"
      title="zoom out"
      aria-label="zoom out"
      disabled={minZoomReached}
      {...buttonProps}
    >
      <MinusIcon />
    </ControlButton>
  {/if}
  {#if showFitView}
    <ControlButton
      class="svelte-flow__controls-fitview"
      onclick={onFitViewHandler}
      title="fit view"
      aria-label="fit view"
      {...buttonProps}
    >
      <FitViewIcon />
    </ControlButton>
  {/if}
  {#if showLock}
    <ControlButton
      class="svelte-flow__controls-interactive"
      onclick={onToggleInteractivity}
      title="toggle interactivity"
      aria-label="toggle interactivity"
      {...buttonProps}
    >
      {#if isInteractive}<UnlockIcon />{:else}<LockIcon />{/if}
    </ControlButton>
  {/if}
  {#if children}
    {@render children()}
  {/if}
  {#if after}
    {@render after()}
  {/if}
</Panel>
