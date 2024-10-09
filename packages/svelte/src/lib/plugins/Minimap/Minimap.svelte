<script lang="ts" context="module">
  declare const window: Window | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getAttrFunction = (func: any): GetMiniMapNodeAttribute =>
    func instanceof Function ? func : () => func;
</script>

<script lang="ts">
  import cc from 'classcat';
  import {
    getBoundsOfRects,
    getInternalNodesBounds,
    getNodeDimensions,
    nodeHasDimensions,
    type Rect
  } from '@xyflow/system';

  import { useStore } from '$lib/store';
  import { Panel } from '$lib/container/Panel';
  import MinimapNode from './MinimapNode.svelte';
  import interactive from './interactive';
  import type { GetMiniMapNodeAttribute, MiniMapProps } from './types';

  type $$Props = MiniMapProps;

  export let position: $$Props['position'] = 'bottom-right';
  export let ariaLabel: $$Props['ariaLabel'] = 'Mini map';
  export let nodeStrokeColor: $$Props['nodeStrokeColor'] = 'transparent';
  export let nodeColor: $$Props['nodeColor'] = undefined;
  export let nodeClass: $$Props['nodeClass'] = '';
  export let nodeBorderRadius: $$Props['nodeBorderRadius'] = 5;
  export let nodeStrokeWidth: $$Props['nodeStrokeWidth'] = 2;
  export let bgColor: $$Props['bgColor'] = undefined;
  export let maskColor: $$Props['maskColor'] = undefined;
  export let maskStrokeColor: $$Props['maskStrokeColor'] = undefined;
  export let maskStrokeWidth: $$Props['maskStrokeWidth'] = undefined;
  export let width: $$Props['width'] = undefined;
  export let height: $$Props['height'] = undefined;
  export let pannable: $$Props['pannable'] = true;
  export let zoomable: $$Props['zoomable'] = true;
  export let inversePan: $$Props['inversePan'] = undefined;
  export let zoomStep: $$Props['zoomStep'] = undefined;
  export let style: $$Props['style'] = '';

  let className: $$Props['class'] = '';
  export { className as class };

  const defaultWidth = 200;
  const defaultHeight = 150;
  const {
    nodes,
    nodeLookup,
    viewport,
    width: containerWidth,
    height: containerHeight,
    flowId,
    panZoom,
    translateExtent
  } = useStore();

  const nodeColorFunc = nodeColor === undefined ? undefined : getAttrFunction(nodeColor);
  const nodeStrokeColorFunc = getAttrFunction(nodeStrokeColor);
  const nodeClassFunc = getAttrFunction(nodeClass);
  const shapeRendering =
    // @ts-expect-error - TS doesn't know about chrome
    typeof window === 'undefined' || !!window.chrome ? 'crispEdges' : 'geometricPrecision';
  const labelledBy = `svelte-flow__minimap-desc-${$flowId}`;

  $: viewBB = {
    x: -$viewport.x / $viewport.zoom,
    y: -$viewport.y / $viewport.zoom,
    width: $containerWidth / $viewport.zoom,
    height: $containerHeight / $viewport.zoom
  };
  let boundingRect: Rect = viewBB;

  $: {
    boundingRect =
      $nodeLookup.size > 0 ? getBoundsOfRects(getInternalNodesBounds($nodeLookup), viewBB) : viewBB;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $nodes;
  }

  $: elementWidth = width ?? defaultWidth;
  $: elementHeight = height ?? defaultHeight;
  $: scaledWidth = boundingRect.width / elementWidth;
  $: scaledHeight = boundingRect.height / elementHeight;
  $: viewScale = Math.max(scaledWidth, scaledHeight);
  $: viewWidth = viewScale * elementWidth;
  $: viewHeight = viewScale * elementHeight;
  $: offset = 5 * viewScale;
  $: x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
  $: y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
  $: viewboxWidth = viewWidth + offset * 2;
  $: viewboxHeight = viewHeight + offset * 2;

  const getViewScale = () => viewScale;
</script>

<Panel
  {position}
  style={style + (bgColor ? `;--xy-minimap-background-color-props:${bgColor}` : '')}
  class={cc(['svelte-flow__minimap', className])}
  data-testid="svelte-flow__minimap"
>
  {#if $panZoom}
    <svg
      width={elementWidth}
      height={elementHeight}
      viewBox="{x} {y} {viewboxWidth} {viewboxHeight}"
      class="svelte-flow__minimap-svg"
      role="img"
      aria-labelledby={labelledBy}
      style:--xy-minimap-mask-background-color-props={maskColor}
      style:--xy-minimap-mask-stroke-color-props={maskStrokeColor}
      style:--xy-minimap-mask-stroke-width-props={maskStrokeWidth
        ? maskStrokeWidth * viewScale
        : undefined}
      use:interactive={{
        panZoom: $panZoom,
        viewport,
        getViewScale,
        translateExtent: $translateExtent,
        width: $containerWidth,
        height: $containerHeight,
        inversePan,
        zoomStep,
        pannable,
        zoomable
      }}
    >
      {#if ariaLabel}<title id={labelledBy}>{ariaLabel}</title>{/if}

      {#each $nodes as userNode (userNode.id)}
        {@const node = $nodeLookup.get(userNode.id)}
        {#if node && nodeHasDimensions(node)}
          {@const nodeDimesions = getNodeDimensions(node)}
          <MinimapNode
            x={node.internals.positionAbsolute.x}
            y={node.internals.positionAbsolute.y}
            {...nodeDimesions}
            selected={node.selected}
            color={nodeColorFunc?.(node)}
            borderRadius={nodeBorderRadius}
            strokeColor={nodeStrokeColorFunc(node)}
            strokeWidth={nodeStrokeWidth}
            {shapeRendering}
            class={nodeClassFunc(node)}
          />
        {/if}
      {/each}
      <path
        class="svelte-flow__minimap-mask"
        d="M{x - offset},{y - offset}h{viewboxWidth + offset * 2}v{viewboxHeight +
          offset * 2}h{-viewboxWidth - offset * 2}z
      M{viewBB.x},{viewBB.y}h{viewBB.width}v{viewBB.height}h{-viewBB.width}z"
        fill-rule="evenodd"
        pointer-events="none"
      />
    </svg>
  {/if}
</Panel>
