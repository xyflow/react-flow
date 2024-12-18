import { type MutableRefObject, useEffect } from 'react';
import { getDimensions, XYError, XYErrorCode } from '@xyflow/system';

import { useStoreApi } from '../hooks/useStore';

/**
 * Hook for handling resize events.
 *
 * @internal
 */
export function useResizeHandler(domNode: MutableRefObject<HTMLDivElement | null>): void {
  const store = useStoreApi();

  useEffect(() => {
    const updateDimensions = () => {
      if (!domNode.current) {
        return false;
      }
      const size = getDimensions(domNode.current!);

      if (size.height === 0 || size.width === 0) {
        const error = new XYError(XYErrorCode.MISSING_CONTAINER_DIMENSIONS);
        store.getState().onError?.(error.code, error.message, error);
      }

      store.setState({ width: size.width || 500, height: size.height || 500 });
    };

    if (domNode.current) {
      updateDimensions();
      window.addEventListener('resize', updateDimensions);

      const resizeObserver = new ResizeObserver(() => updateDimensions());
      resizeObserver.observe(domNode.current);

      return () => {
        window.removeEventListener('resize', updateDimensions);

        if (resizeObserver && domNode.current) {
          resizeObserver.unobserve(domNode.current);
        }
      };
    }
  }, []);
}
