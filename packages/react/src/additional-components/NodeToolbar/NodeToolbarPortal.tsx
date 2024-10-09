import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import type { ReactFlowState } from '../../types';
import { useStore } from '../../hooks/useStore';

const selector = (state: ReactFlowState) => state.domNode?.querySelector('.react-flow__renderer');

export function NodeToolbarPortal({ children }: { children: ReactNode }) : JSX.Element | null {
  const wrapperRef = useStore(selector);

  if (!wrapperRef) {
    return null;
  }

  return createPortal(children, wrapperRef);
}
