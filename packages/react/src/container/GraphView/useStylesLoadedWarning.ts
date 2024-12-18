import { useEffect, useRef } from 'react';

import { useStoreApi } from '../../hooks/useStore';
import { XYError, XYErrorCode } from '@xyflow/system';

export function useStylesLoadedWarning() {
  const store = useStoreApi();
  const checked = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (!checked.current) {
        const pane = document.querySelector('.react-flow__pane');

        if (pane && !(window.getComputedStyle(pane).zIndex === '1')) {
          const error = new XYError(XYErrorCode.MISSING_STYLES, 'react');
          store.getState().onError?.(error.code, error.message, error);
        }

        checked.current = true;
      }
    }
  }, []);
}
