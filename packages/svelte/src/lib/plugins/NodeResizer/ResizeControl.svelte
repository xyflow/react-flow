<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import cc from 'classcat';
  import { useStore } from '$lib/store';
  import {
    XYResizer,
    ResizeControlVariant,
    type ControlPosition,
    type XYResizerInstance,
    type XYResizerChange,
    type XYResizerChildChange
  } from '@xyflow/system';
  import type { ResizeControlProps } from './types';
  import { useSvelteFlow } from '$lib/hooks/useSvelteFlow.svelte';

  let {
    nodeId,
    position,
    variant = ResizeControlVariant.Handle,
    color,
    minWidth = 10,
    minHeight = 10,
    maxWidth = Number.MAX_VALUE,
    maxHeight = Number.MAX_VALUE,
    keepAspectRatio = false,
    shouldResize,
    onResizeStart,
    onResize,
    onResizeEnd,
    style = '',
    class: className,
    children
  }: ResizeControlProps = $props();

  const store = useStore();

  const { updateNode } = useSvelteFlow();

  let id = $derived(
    typeof nodeId === 'string' ? nodeId : getContext<string>('svelteflow__node_id')
  );

  let resizeControlRef: HTMLDivElement;
  let resizer: XYResizerInstance | null = $state(null);

  let controlPosition = $derived.by(() => {
    let defaultPosition = (
      variant === ResizeControlVariant.Line ? 'right' : 'bottom-right'
    ) as ControlPosition;
    return position ?? defaultPosition;
  });

  let positionClassNames = $derived(controlPosition.split('-'));

  let controlStyle = $derived.by(() => {
    let colorStyleProp =
      variant === ResizeControlVariant.Line ? 'border-color' : 'background-color';
    return color ? `${style} ${colorStyleProp}: ${color};` : style;
  });

  onMount(() => {
    if (resizeControlRef) {
      resizer = XYResizer({
        domNode: resizeControlRef,
        nodeId: id,
        getStoreItems: () => {
          return {
            nodeLookup: store.nodeLookup,
            transform: [store.viewport.x, store.viewport.y, store.viewport.zoom],
            snapGrid: store.snapGrid ?? undefined,
            snapToGrid: !!store.snapGrid,
            nodeOrigin: store.nodeOrigin,
            paneDomNode: store.domNode
          };
        },
        onChange: (change: XYResizerChange, childChanges: XYResizerChildChange[]) => {
          updateNode(id, (node) => ({
            ...node,
            position: { x: change.x ?? node.position.x, y: change.y ?? node.position.y },
            width: change.width ?? node.width,
            height: change.height ?? node.height
          }));

          // TODO: performance?
          for (const childChange of childChanges) {
            updateNode(childChange.id, (node) => ({
              ...node,
              position: childChange.position
            }));
          }
        }
      });
    }
    return () => {
      resizer?.destroy();
    };
  });

  $effect.pre(() => {
    resizer?.update({
      controlPosition,
      boundaries: {
        minWidth,
        minHeight,
        maxWidth,
        maxHeight
      },
      keepAspectRatio: !!keepAspectRatio,
      onResizeStart,
      onResize,
      onResizeEnd,
      shouldResize
    });
  });
</script>

<div
  class={cc(['svelte-flow__resize-control', 'nodrag', ...positionClassNames, variant, className])}
  bind:this={resizeControlRef}
  style={controlStyle}
>
  {@render children?.()}
</div>
