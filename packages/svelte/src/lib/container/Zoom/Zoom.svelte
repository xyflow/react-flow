<script lang="ts">
  import { onMount } from 'svelte';
  import { PanOnScrollMode, type PanZoomInstance, type Transform } from '@xyflow/system';

  import zoom from '$lib/actions/zoom';
  import type { ZoomProps } from './types';

  let {
    store,
    onMoveStart,
    onMove,
    onMoveEnd,
    panOnScrollMode = PanOnScrollMode.Free,
    preventScrolling = true,
    zoomOnScroll = true,
    zoomOnDoubleClick = true,
    zoomOnPinch = true,
    panOnDrag = true,
    panOnScroll = false,
    paneClickDistance = 1,
    children
  }: ZoomProps = $props();

  let panOnDragActive = $derived(store.panActivationKeyPressed || panOnDrag);
  let panOnScrollActive = $derived(store.panActivationKeyPressed || panOnScroll);

  const onTransformChange = (transform: Transform) =>
    (store.viewport = { x: transform[0], y: transform[1], zoom: transform[2] });

  // We extract the initial value by destructuring
  const { viewport: initialViewport } = store;

  onMount(() => {
    store.viewportInitialized = true;
  });
</script>

<div
  class="svelte-flow__zoom"
  use:zoom={{
    viewport: store.viewport,
    minZoom: store.minZoom,
    maxZoom: store.maxZoom,
    initialViewport,
    onDraggingChange: (dragging: boolean) => {
      store.dragging = dragging;
    },
    setPanZoomInstance: (instance: PanZoomInstance) => {
      store.panZoom = instance;
    },
    onPanZoomStart: onMoveStart,
    onPanZoom: onMove,
    onPanZoomEnd: onMoveEnd,
    zoomOnScroll,
    zoomOnDoubleClick,
    zoomOnPinch,
    panOnScroll: panOnScrollActive,
    panOnDrag: panOnDragActive,
    panOnScrollSpeed: 0.5,
    panOnScrollMode: panOnScrollMode || PanOnScrollMode.Free,
    zoomActivationKeyPressed: store.zoomActivationKeyPressed,
    preventScrolling: typeof preventScrolling === 'boolean' ? preventScrolling : true,
    noPanClassName: 'nopan',
    noWheelClassName: 'nowheel',
    userSelectionActive: !!store.selectionRect,
    translateExtent: store.translateExtent,
    lib: 'svelte',
    paneClickDistance,
    onTransformChange
  }}
>
  {@render children()}
</div>

<style>
  .svelte-flow__zoom {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 4;
  }
</style>
