import { useEffect } from 'react';

import { useStoreState, useStoreActions } from '../store/hooks';
import useKeyPress from './useKeyPress';
import { isEdge, getConnectedEdges } from '../utils/graph';

export default ({ deleteKeyCode, onElementsRemove }) => {
  const state = useStoreState(s => ({ selectedElements: s.selectedElements, edges: s.edges }))
  const setNodesSelection = useStoreActions(a => a.setNodesSelection);
  const deleteKeyPressed = useKeyPress(deleteKeyCode);

  useEffect(() => {
    if (deleteKeyPressed && state.selectedElements.length) {
      let elementsToRemove = state.selectedElements;

      // we also want to remove the edges if only one node is selected
      if (state.selectedElements.length === 1 && !isEdge(state.selectedElements[0])) {
        const connectedEdges = getConnectedEdges(state.selectedElements, state.edges);
        elementsToRemove = [...state.selectedElements, ...connectedEdges];
      }

      onElementsRemove(elementsToRemove);
      setNodesSelection({ isActive: false });
    }
  }, [deleteKeyPressed])

  return null;
};
