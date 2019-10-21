import React, { memo, HTMLAttributes, CSSProperties } from 'react';
import classnames from 'classnames';

import { useStoreState } from '../../store/hooks';
import { GridType } from '../../types';

interface GridProps extends HTMLAttributes<SVGElement> {
  backgroundType?: GridType;
  gap?: number;
  color?: string;
  size?: number;
}

const baseStyles: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
};

const createGridLines = (
  width: number,
  height: number,
  xOffset: number,
  yOffset: number,
  gap: number
): string => {
  const lineCountX = Math.ceil(width / gap) + 1;
  const lineCountY = Math.ceil(height / gap) + 1;

  const xValues = Array.from(
    { length: lineCountX },
    (_, i) => `M${i * gap + xOffset} 0 V${height}`
  );
  const yValues = Array.from(
    { length: lineCountY },
    (_, i) => `M0 ${i * gap + yOffset} H${width}`
  );

  return [...xValues, ...yValues].join(' ');
};

const createGridDots = (
  width: number,
  height: number,
  xOffset: number,
  yOffset: number,
  gap: number,
  size: number
): string => {
  const lineCountX = Math.ceil(width / gap) + 1;
  const lineCountY = Math.ceil(height / gap) + 1;

  const values = Array.from({ length: lineCountX }, (_, col) => {
    const x = col * gap + xOffset;
    return Array.from({ length: lineCountY }, (_, row) => {
      const y = row * gap + yOffset;
      return `M${x} ${y -
        size} l${size} ${size} l${-size} ${size} l${-size} ${-size}z`;
    }).join(' ');
  });

  return values.join(' ');
};

const Grid = memo(
  ({
    gap = 24,
    color = '#aaa',
    size = 0.5,
    style = {},
    className = '',
    backgroundType = GridType.Dots,
  }: GridProps) => {
    const {
      width,
      height,
      transform: [x, y, scale],
    } = useStoreState(s => s);

    const gridClasses = classnames('react-flow__grid', className);
    const scaledGap = gap * scale;

    const xOffset = x % scaledGap;
    const yOffset = y % scaledGap;
    const isLines = backgroundType === 'lines';
    const path = isLines
      ? createGridLines(width, height, xOffset, yOffset, scaledGap)
      : createGridDots(width, height, xOffset, yOffset, scaledGap, size);

    const fill = isLines ? 'none' : color;
    const stroke = isLines ? color : 'none';

    return (
      <svg
        width={width}
        height={height}
        style={{ ...baseStyles, ...style }}
        className={gridClasses}
      >
        <path fill={fill} stroke={stroke} strokeWidth={size} d={path} />
      </svg>
    );
  }
);

Grid.displayName = 'Grid';

export default Grid;
