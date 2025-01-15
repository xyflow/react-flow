import { XYDrag, type OnDrag } from '@xyflow/system';

import type { SvelteFlowStore } from '$lib/store/types';

export type UseDragParams = {
  store: SvelteFlowStore;
  disabled?: boolean;
  noDragClass?: string;
  handleSelector?: string;
  nodeId?: string;
  isSelectable?: boolean;
  nodeClickDistance?: number;
  onDrag?: OnDrag;
  onDragStart?: OnDrag;
  onDragStop?: OnDrag;
  onNodeMouseDown?: (id: string) => void;
};

export default function drag(domNode: Element, params: UseDragParams) {
  const { store, onDrag, onDragStart, onDragStop, onNodeMouseDown } = params;
  const dragInstance = XYDrag({
    onDrag,
    onDragStart,
    onDragStop,
    onNodeMouseDown,
    getStoreItems: () => {
      const { snapGrid, viewport } = store;

      return {
        nodes: store.nodes,
        nodeLookup: store.nodeLookup,
        edges: store.edges,
        nodeExtent: store.nodeExtent,
        snapGrid: snapGrid ? snapGrid : [0, 0],
        snapToGrid: !!snapGrid,
        nodeOrigin: store.nodeOrigin,
        multiSelectionActive: store.multiselectionKeyPressed,
        domNode: store.domNode,
        transform: [viewport.x, viewport.y, viewport.zoom],
        autoPanOnNodeDrag: store.autoPanOnNodeDrag,
        nodesDraggable: store.nodesDraggable,
        selectNodesOnDrag: store.selectNodesOnDrag,
        nodeDragThreshold: store.nodeDragThreshold,
        unselectNodesAndEdges: store.unselectNodesAndEdges,
        updateNodePositions: store.updateNodePositions,
        panBy: store.panBy
      };
    }
  });

  function updateDrag(domNode: Element, params: UseDragParams) {
    if (params.disabled) {
      dragInstance.destroy();
      return;
    }

    dragInstance.update({
      domNode,
      noDragClassName: params.noDragClass,
      handleSelector: params.handleSelector,
      nodeId: params.nodeId,
      isSelectable: params.isSelectable,
      nodeClickDistance: params.nodeClickDistance
    });
  }

  updateDrag(domNode, params);

  return {
    update(params: UseDragParams) {
      updateDrag(domNode, params);
    },
    destroy() {
      dragInstance.destroy();
    }
  };
}
