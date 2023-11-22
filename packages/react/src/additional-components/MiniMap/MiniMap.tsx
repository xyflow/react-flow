/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useEffect, useRef, type MouseEvent, useCallback, CSSProperties } from 'react';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';
import { getNodesBounds, getBoundsOfRects, XYMinimap, type Rect, type XYMinimapInstance } from '@xyflow/system';

import { useStore, useStoreApi } from '../../hooks/useStore';
import Panel from '../../components/Panel';
import type { ReactFlowState } from '../../types';

import type { MiniMapProps } from './types';
import MiniMapNodes from './MiniMapNodes';

const defaultWidth = 200;
const defaultHeight = 150;

const selector = (s: ReactFlowState) => {
  const viewBB: Rect = {
    x: -s.transform[0] / s.transform[2],
    y: -s.transform[1] / s.transform[2],
    width: s.width / s.transform[2],
    height: s.height / s.transform[2],
  };

  return {
    viewBB,
    boundingRect: s.nodes.length > 0 ? getBoundsOfRects(getNodesBounds(s.nodes, s.nodeOrigin), viewBB) : viewBB,
    rfId: s.rfId,
    nodeOrigin: s.nodeOrigin,
    panZoom: s.panZoom,
    translateExtent: s.translateExtent,
    flowWidth: s.width,
    flowHeight: s.height,
  };
};

const ARIA_LABEL_KEY = 'react-flow__minimap-desc';

function MiniMap({
  style,
  className,
  nodeStrokeColor,
  nodeColor,
  nodeClassName = '',
  nodeBorderRadius = 5,
  nodeStrokeWidth,
  // We need to rename the prop to be `CapitalCase` so that JSX will render it as
  // a component properly.
  nodeComponent,
  maskColor,
  maskStrokeColor = 'none',
  maskStrokeWidth = 1,
  position = 'bottom-right',
  onClick,
  onNodeClick,
  pannable = false,
  zoomable = false,
  ariaLabel = 'React Flow mini map',
  inversePan,
  zoomStep = 10,
  offsetScale = 5,
}: MiniMapProps) {
  const store = useStoreApi();
  const svg = useRef<SVGSVGElement>(null);
  const { boundingRect, viewBB, rfId, panZoom, translateExtent, flowWidth, flowHeight } = useStore(selector, shallow);
  const elementWidth = (style?.width as number) ?? defaultWidth;
  const elementHeight = (style?.height as number) ?? defaultHeight;
  const scaledWidth = boundingRect.width / elementWidth;
  const scaledHeight = boundingRect.height / elementHeight;
  const viewScale = Math.max(scaledWidth, scaledHeight);
  const viewWidth = viewScale * elementWidth;
  const viewHeight = viewScale * elementHeight;
  const offset = offsetScale * viewScale;
  const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
  const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
  const width = viewWidth + offset * 2;
  const height = viewHeight + offset * 2;
  const labelledBy = `${ARIA_LABEL_KEY}-${rfId}`;
  const viewScaleRef = useRef(0);
  const minimapInstance = useRef<XYMinimapInstance>();

  viewScaleRef.current = viewScale;

  useEffect(() => {
    if (svg.current && panZoom) {
      minimapInstance.current = XYMinimap({
        domNode: svg.current,
        panZoom,
        getTransform: () => store.getState().transform,
        getViewScale: () => viewScaleRef.current,
      });

      return () => {
        minimapInstance.current?.destroy();
      };
    }
  }, [panZoom]);

  useEffect(() => {
    minimapInstance.current?.update({
      translateExtent,
      width: flowWidth,
      height: flowHeight,
      inversePan,
      pannable,
      zoomStep,
      zoomable,
    });
  }, [pannable, zoomable, inversePan, zoomStep, translateExtent, flowWidth, flowHeight]);

  const onSvgClick = onClick
    ? (event: MouseEvent) => {
        const [x, y] = minimapInstance.current?.pointer(event) || [0, 0];
        onClick(event, { x, y });
      }
    : undefined;

  const onSvgNodeClick = onNodeClick
    ? useCallback((event: MouseEvent, nodeId: string) => {
        const node = store.getState().nodeLookup.get(nodeId)!;
        onNodeClick(event, node);
      }, [])
    : undefined;

  return (
    <Panel
      position={position}
      style={
        {
          ...style,
          '--minimap-mask-color-props': typeof maskColor === 'string' ? maskColor : undefined,
          '--minimap-node-background-color-props': typeof nodeColor === 'string' ? nodeColor : undefined,
          '--minimap-node-stroke-color-props': typeof nodeStrokeColor === 'string' ? nodeStrokeColor : undefined,
          '--minimap-node-stroke-width-props': typeof nodeStrokeWidth === 'string' ? nodeStrokeWidth : undefined,
        } as CSSProperties
      }
      className={cc(['react-flow__minimap', className])}
      data-testid="rf__minimap"
    >
      <svg
        width={elementWidth}
        height={elementHeight}
        viewBox={`${x} ${y} ${width} ${height}`}
        role="img"
        aria-labelledby={labelledBy}
        ref={svg}
        onClick={onSvgClick}
      >
        {ariaLabel && <title id={labelledBy}>{ariaLabel}</title>}
        <MiniMapNodes
          onClick={onSvgNodeClick}
          nodeColor={nodeColor}
          nodeStrokeColor={nodeStrokeColor}
          nodeBorderRadius={nodeBorderRadius}
          nodeClassName={nodeClassName}
          nodeStrokeWidth={nodeStrokeWidth}
          nodeComponent={nodeComponent}
        />
        <path
          className="react-flow__minimap-mask"
          d={`M${x - offset},${y - offset}h${width + offset * 2}v${height + offset * 2}h${-width - offset * 2}z
        M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`}
          fillRule="evenodd"
          stroke={maskStrokeColor}
          strokeWidth={maskStrokeWidth}
          pointerEvents="none"
        />
      </svg>
    </Panel>
  );
}

MiniMap.displayName = 'MiniMap';

export default memo(MiniMap);
