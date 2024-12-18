import { get } from 'svelte/store';

import { useStore } from '$lib/store';
import { XYError, XYErrorCode } from '@xyflow/system';

export function useHandleEdgeSelect() {
  const {
    edgeLookup,
    selectionRect,
    selectionRectMode,
    multiselectionKeyPressed,
    addSelectedEdges,
    unselectNodesAndEdges,
    elementsSelectable
  } = useStore();

  return (id: string) => {
    const edge = get(edgeLookup).get(id);

    if (!edge) {
      const error = new XYError(XYErrorCode.NODE_NOT_FOUND, id);
      console.warn(error.code, error.message);
      return;
    }

    const selectable =
      edge.selectable || (get(elementsSelectable) && typeof edge.selectable === 'undefined');

    if (selectable) {
      selectionRect.set(null);
      selectionRectMode.set(null);

      if (!edge.selected) {
        addSelectedEdges([id]);
      } else if (edge.selected && get(multiselectionKeyPressed)) {
        unselectNodesAndEdges({ nodes: [], edges: [edge] });
      }
    }
  };
}
