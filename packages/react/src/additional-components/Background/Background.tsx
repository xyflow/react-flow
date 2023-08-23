import { CSSProperties, memo, useRef } from 'react';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';

import { useStore } from '../../hooks/useStore';
import { type ReactFlowState } from '../../types';
import { BackgroundProps, BackgroundVariant } from './types';
import { DotPattern, LinePattern } from './Patterns';
import { containerStyle } from '../../styles/utils';

const defaultSize = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6,
};

const selector = (s: ReactFlowState) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });

function Background({
  id,
  variant = BackgroundVariant.Dots,
  // only used for dots and cross
  gap = 20,
  // only used for lines and cross
  size,
  lineWidth = 1,
  offset = 2,
  color,
  bgColor,
  style,
  className,
  patternClassName,
}: BackgroundProps) {
  const ref = useRef<SVGSVGElement>(null);
  const { transform, patternId } = useStore(selector, shallow);
  const patternSize = size || defaultSize[variant];
  const isDots = variant === BackgroundVariant.Dots;
  const isCross = variant === BackgroundVariant.Cross;
  const gapXY: [number, number] = Array.isArray(gap) ? gap : [gap, gap];
  const scaledGap: [number, number] = [gapXY[0] * transform[2] || 1, gapXY[1] * transform[2] || 1];
  const scaledSize = patternSize * transform[2];

  const patternDimensions: [number, number] = isCross ? [scaledSize, scaledSize] : scaledGap;

  const patternOffset = isDots
    ? [scaledSize / offset, scaledSize / offset]
    : [patternDimensions[0] / offset, patternDimensions[1] / offset];

  return (
    <svg
      className={cc(['react-flow__background', className])}
      style={
        {
          ...style,
          ...containerStyle,
          '--background-color-props': bgColor,
          '--background-pattern-color-props': color,
        } as CSSProperties
      }
      ref={ref}
      data-testid="rf__background"
    >
      <pattern
        id={patternId + id}
        x={transform[0] % scaledGap[0]}
        y={transform[1] % scaledGap[1]}
        width={scaledGap[0]}
        height={scaledGap[1]}
        patternUnits="userSpaceOnUse"
        patternTransform={`translate(-${patternOffset[0]},-${patternOffset[1]})`}
      >
        {isDots ? (
          <DotPattern radius={scaledSize / offset} className={patternClassName} />
        ) : (
          <LinePattern
            dimensions={patternDimensions}
            lineWidth={lineWidth}
            variant={variant}
            className={patternClassName}
          />
        )}
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId + id})`} />
    </svg>
  );
}

Background.displayName = 'Background';

export default memo(Background);
