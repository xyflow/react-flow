import { useMemo } from 'react';
import { type EdgeMarker, MarkerType, XYError, XYErrorCode } from '@xyflow/system';

import { useStoreApi } from '../../hooks/useStore';

type SymbolProps = Omit<EdgeMarker, 'type'>;

const ArrowSymbol = ({ color = 'none', strokeWidth = 1 }: SymbolProps) => {
  return (
    <polyline
      style={{
        stroke: color,
        strokeWidth,
      }}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      points="-5,-4 0,0 -5,4"
    />
  );
};

const ArrowClosedSymbol = ({ color = 'none', strokeWidth = 1 }: SymbolProps) => {
  return (
    <polyline
      style={{
        stroke: color,
        fill: color,
        strokeWidth,
      }}
      strokeLinecap="round"
      strokeLinejoin="round"
      points="-5,-4 0,0 -5,4 -5,-4"
    />
  );
};

export const MarkerSymbols = {
  [MarkerType.Arrow]: ArrowSymbol,
  [MarkerType.ArrowClosed]: ArrowClosedSymbol,
};

export function useMarkerSymbol(type: MarkerType) {
  const store = useStoreApi();

  const symbol = useMemo(() => {
    const symbolExists = Object.prototype.hasOwnProperty.call(MarkerSymbols, type);

    if (!symbolExists) {
      const error = new XYError(XYErrorCode.MARKER_TYPE_NOT_FOUND, type);
      store.getState().onError?.(error.code, error.message, error);

      return null;
    }

    return MarkerSymbols[type];
  }, [type]);

  return symbol;
}
