<script lang="ts">
  import { getContext, setContext, onDestroy } from 'svelte';
  import cc from 'classcat';
  import { PanOnScrollMode } from '@xyflow/system';

  import { key, createStore } from '$lib/store';
  import { Zoom } from '$lib/container/Zoom';
  import { Pane } from '$lib/container/Pane';
  import { Viewport as ViewportComponent } from '$lib/container/Viewport';
  import { NodeRenderer } from '$lib/container/NodeRenderer';
  import { EdgeRenderer } from '$lib/container/EdgeRenderer';
  import { NodeSelection } from '$lib/components/NodeSelection';
  import { Selection } from '$lib/components/Selection';
  import { KeyHandler } from '$lib/components/KeyHandler';
  import { ConnectionLine } from '$lib/components/ConnectionLine';
  import { Attribution } from '$lib/components/Attribution';
  import type { SvelteFlowProps } from './types';
  import { type ProviderContext, type StoreContext } from '$lib/store/types';

  let {
    style,
    class: className,
    width,
    height,
    proOptions,
    selectionKey,
    deleteKey,
    panActivationKey,
    multiSelectionKey,
    zoomActivationKey,
    paneClickDistance = 1,
    nodeClickDistance = 1,
    onMoveStart,
    onMoveEnd,
    onMove,
    connectionLine,
    onnodeclick,
    onnodecontextmenu,
    onnodedrag,
    onnodedragstart,
    onnodedragstop,
    onnodemouseenter,
    onnodemousemove,
    onnodemouseleave,
    onselectionclick,
    onselectioncontextmenu,
    onedgeclick,
    onedgecontextmenu,
    onedgemouseenter,
    onedgemouseleave,
    onpaneclick,
    onpanecontextmenu,
    panOnScrollMode = PanOnScrollMode.Free,
    preventScrolling = true,
    zoomOnScroll = true,
    zoomOnDoubleClick = true,
    zoomOnPinch = true,
    panOnScroll = false,
    panOnDrag = true,
    selectionOnDrag = true,
    connectionLineContainerStyle = '',
    connectionLineStyle = '',
    attributionPosition,
    children,
    nodes = $bindable([]),
    edges = $bindable([]),
    viewport = $bindable(undefined),
    ...props
  }: SvelteFlowProps = $props();

  let domNode = $state<HTMLDivElement>();
  let clientWidth = $state<number | undefined>(width);
  let clientHeight = $state<number | undefined>(height);

  const store = createStore({
    props,
    get domNode() {
      return domNode;
    },
    get width() {
      return clientWidth;
    },
    get height() {
      return clientHeight;
    },
    get nodes() {
      return nodes;
    },
    set nodes(newNodes) {
      nodes = newNodes;
    },
    get edges() {
      return edges;
    },
    set edges(newEdges) {
      edges = newEdges;
    },
    get viewport() {
      return viewport;
    },
    set viewport(newViewport) {
      viewport = newViewport;
    }
  });

  // Set store for provider context
  const providerContext = getContext<ProviderContext>(key);
  if (providerContext && providerContext.setStore) {
    providerContext.setStore(store);
  }

  // Overwrite store context to give children direct access
  setContext(key, {
    provider: false,
    getStore() {
      return store;
    }
  } satisfies StoreContext);

  onDestroy(() => {
    store.reset();
  });
</script>

<div
  bind:this={domNode}
  bind:clientWidth
  bind:clientHeight
  style:width
  style:height
  {style}
  class={cc(['svelte-flow', className, store.colorMode])}
  data-testid="svelte-flow__wrapper"
  role="application"
  {...props}
>
  <KeyHandler
    {store}
    {selectionKey}
    {deleteKey}
    {panActivationKey}
    {multiSelectionKey}
    {zoomActivationKey}
  />
  <Zoom
    {store}
    {onMoveStart}
    {onMove}
    {onMoveEnd}
    {panOnScrollMode}
    {preventScrolling}
    {zoomOnScroll}
    {zoomOnDoubleClick}
    {zoomOnPinch}
    {panOnScroll}
    {panOnDrag}
    {paneClickDistance}
  >
    <Pane {store} {onpaneclick} {onpanecontextmenu} {panOnDrag} {selectionOnDrag}>
      <ViewportComponent {store}>
        <EdgeRenderer
          {store}
          {onedgeclick}
          {onedgecontextmenu}
          {onedgemouseenter}
          {onedgemouseleave}
        />
        <ConnectionLine
          {store}
          containerStyle={connectionLineContainerStyle}
          style={connectionLineStyle}
          {connectionLine}
        />
        <div class="svelte-flow__edgelabel-renderer"></div>
        <div class="svelte-flow__viewport-portal"></div>
        <NodeRenderer
          {store}
          {nodeClickDistance}
          {onnodeclick}
          {onnodecontextmenu}
          {onnodemouseenter}
          {onnodemousemove}
          {onnodemouseleave}
          {onnodedrag}
          {onnodedragstart}
          {onnodedragstop}
        />
        <NodeSelection
          {store}
          {onselectionclick}
          {onselectioncontextmenu}
          {onnodedrag}
          {onnodedragstart}
          {onnodedragstop}
        />
      </ViewportComponent>
      <Selection
        isVisible={!!(store.selectionRect && store.selectionRectMode === 'user')}
        width={store.selectionRect?.width}
        height={store.selectionRect?.height}
        x={store.selectionRect?.x}
        y={store.selectionRect?.y}
      />
    </Pane>
  </Zoom>
  <Attribution {proOptions} position={attributionPosition} />
  {@render children?.()}
</div>

<style>
  .svelte-flow {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    z-index: 0;

    background-color: var(--background-color, var(--background-color-default));
  }

  :root {
    --background-color-default: #fff;
    --background-pattern-color-default: #ddd;

    --minimap-mask-color-default: rgb(240, 240, 240, 0.6);
    --minimap-mask-stroke-color-default: none;
    --minimap-mask-stroke-width-default: 1;

    --controls-button-background-color-default: #fefefe;
    --controls-button-background-color-hover-default: #f4f4f4;
    --controls-button-color-default: inherit;
    --controls-button-color-hover-default: inherit;
    --controls-button-border-color-default: #eee;
  }
</style>
