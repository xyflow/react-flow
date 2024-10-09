import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useStore } from '../../hooks/useStore';
import type { ReactFlowState } from '../../types';

const selector = (s: ReactFlowState) => s.domNode?.querySelector('.react-flow__edgelabel-renderer');

export function EdgeLabelRenderer({ children }: { children: ReactNode }) : JSX.Element | null {
  const edgeLabelRenderer = useStore(selector);

  if (!edgeLabelRenderer) {
    return null;
  }

  return createPortal(children, edgeLabelRenderer);
}
