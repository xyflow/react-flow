/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { zoom, zoomIdentity } from 'd3-zoom';
import type { D3ZoomEvent } from 'd3-zoom';
import { select, pointer } from 'd3-selection';
import { shallow } from 'zustand/shallow';

import useKeyPress from '../../hooks/useKeyPress';
import useResizeHandler from '../../hooks/useResizeHandler';
import { useStore, useStoreApi } from '../../hooks/useStore';
import { containerStyle } from '../../styles';
import { clamp } from '../../utils';
import { CoordinateExtent, PanOnScrollMode } from '../../types';
import type { FlowRendererProps } from '../FlowRenderer';
import type { Viewport, ReactFlowState } from '../../types';

type ZoomPaneProps = Omit<
  FlowRendererProps,
  | 'deleteKeyCode'
  | 'selectionKeyCode'
  | 'multiSelectionKeyCode'
  | 'noDragClassName'
  | 'disableKeyboardA11y'
  | 'selectionOnDrag'
>;

const viewChanged = (prevViewport: Viewport, eventViewport: any): boolean =>
  prevViewport.x !== eventViewport.x || prevViewport.y !== eventViewport.y || prevViewport.zoom !== eventViewport.k;

const eventToFlowTransform = (eventViewport: any): Viewport => ({
  x: eventViewport.x,
  y: eventViewport.y,
  zoom: eventViewport.k,
});

const isWrappedWithClass = (event: any, className: string | undefined) => event.target.closest(`.${className}`);

const isRightClickPan = (panOnDrag: FlowRendererProps['panOnDrag'], usedButton: number) =>
  usedButton === 2 && Array.isArray(panOnDrag) && panOnDrag.includes(2);

const selector = (s: ReactFlowState) => ({
  d3Zoom: s.d3Zoom,
  d3Selection: s.d3Selection,
  d3ZoomHandler: s.d3ZoomHandler,
  userSelectionActive: s.userSelectionActive,
});

const ZoomPane = ({
  onMove,
  onMoveStart,
  onMoveEnd,
  onPaneContextMenu,
  zoomOnScroll = true,
  zoomOnPinch = true,
  panOnScroll = false,
  panOnScrollSpeed = 0.5,
  panOnScrollMode = PanOnScrollMode.Free,
  zoomOnDoubleClick = true,
  elementsSelectable,
  panOnDrag = true,
  defaultViewport,
  translateExtent,
  minZoom,
  maxZoom,
  zoomActivationKeyCode,
  preventScrolling = true,
  children,
  noWheelClassName,
  noPanClassName,
}: ZoomPaneProps) => {
  const timerId = useRef<ReturnType<typeof setTimeout>>();
  const store = useStoreApi();
  const isZoomingOrPanning = useRef(false);
  const zoomedWithRightMouseButton = useRef(false);
  const zoomPane = useRef<HTMLDivElement>(null);
  const prevTransform = useRef<Viewport>({ x: 0, y: 0, zoom: 0 });
  const { d3Zoom, d3Selection, d3ZoomHandler, userSelectionActive } = useStore(selector, shallow);
  const zoomActivationKeyPressed = useKeyPress(zoomActivationKeyCode);
  const mouseButton = useRef<number>(0);

  useResizeHandler(zoomPane);

  useEffect(() => {
    if (zoomPane.current) {
      const bbox = zoomPane.current.getBoundingClientRect();
      const d3ZoomInstance = zoom().scaleExtent([minZoom, maxZoom]).translateExtent(translateExtent);
      const selection = select(zoomPane.current as Element).call(d3ZoomInstance);
      const updatedTransform = zoomIdentity
        .translate(defaultViewport.x, defaultViewport.y)
        .scale(clamp(defaultViewport.zoom, minZoom, maxZoom));
      const extent: CoordinateExtent = [
        [0, 0],
        [bbox.width, bbox.height],
      ];

      const constrainedTransform = d3ZoomInstance.constrain()(updatedTransform, extent, translateExtent);
      d3ZoomInstance.transform(selection, constrainedTransform);

      store.setState({
        d3Zoom: d3ZoomInstance,
        d3Selection: selection,
        d3ZoomHandler: selection.on('wheel.zoom'),
        // we need to pass transform because zoom handler is not registered when we set the initial transform
        transform: [constrainedTransform.x, constrainedTransform.y, constrainedTransform.k],
        domNode: zoomPane.current.closest('.react-flow') as HTMLDivElement,
      });
    }
  }, []);

  useEffect(() => {
    if (d3Selection && d3Zoom) {
      if (panOnScroll && !zoomActivationKeyPressed && !userSelectionActive) {
        d3Selection.on(
          'wheel.zoom',
          (event: any) => {
            if (isWrappedWithClass(event, noWheelClassName)) {
              return false;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            const { onViewportChange, transform } = store.getState();
            const [x, y, k] = transform;
            const currentZoom = d3Selection.property('__zoom').k || 1;
            if (onMoveEnd || onViewportChange) {
              const flowTransform = eventToFlowTransform({ x, y, k });
              onMoveEnd?.(event.sourceEvent as MouseEvent | TouchEvent, flowTransform);
            }

            if (event.ctrlKey && zoomOnPinch) {
              const point = pointer(event);
              // taken from https://github.com/d3/d3-zoom/blob/master/src/zoom.js
              const pinchDelta = -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * 10;
              const zoom = currentZoom * Math.pow(2, pinchDelta);
              d3Zoom.scaleTo(d3Selection, zoom, point);

              return;
            }

            // increase scroll speed in firefox
            // firefox: deltaMode === 1; chrome: deltaMode === 0
            const deltaNormalize = event.deltaMode === 1 ? 20 : 1;
            const deltaX = panOnScrollMode === PanOnScrollMode.Vertical ? 0 : event.deltaX * deltaNormalize;
            const deltaY = panOnScrollMode === PanOnScrollMode.Horizontal ? 0 : event.deltaY * deltaNormalize;

            d3Zoom.translateBy(
              d3Selection,
              -(deltaX / currentZoom) * panOnScrollSpeed,
              -(deltaY / currentZoom) * panOnScrollSpeed
            );
          },
          { passive: false }
        );
      } else if (typeof d3ZoomHandler !== 'undefined') {
        d3Selection.on(
          'wheel.zoom',
          function (event: any, d: any) {
            if (!preventScrolling || isWrappedWithClass(event, noWheelClassName)) {
              return null;
            }

            event.preventDefault();
            d3ZoomHandler.call(this, event, d);
          },
          { passive: false }
        );
      }
    }
  }, [
    userSelectionActive,
    panOnScroll,
    panOnScrollMode,
    d3Selection,
    d3Zoom,
    d3ZoomHandler,
    zoomActivationKeyPressed,
    zoomOnPinch,
    preventScrolling,
    noWheelClassName,
  ]);

  useEffect(() => {
    if (d3Zoom) {
      d3Zoom.on('start', (event: D3ZoomEvent<HTMLDivElement, any>) => {
        if (!event.sourceEvent) {
          return null;
        }

        // we need to remember it here, because it's always 0 in the "zoom" event
        mouseButton.current = event.sourceEvent.button;

        const { onViewportChangeStart } = store.getState();
        const flowTransform = eventToFlowTransform(event.transform);

        isZoomingOrPanning.current = true;

        if (event.sourceEvent?.type === 'mousedown') {
          store.setState({ paneDragging: true });
          prevTransform.current = flowTransform;
        }

        if (onMoveStart || onViewportChangeStart) {
          prevTransform.current = flowTransform;

          onViewportChangeStart?.(flowTransform);
          onMoveStart?.(event.sourceEvent as MouseEvent | TouchEvent, flowTransform);
        }
      });
    }
  }, [d3Zoom, onMoveStart]);

  useEffect(() => {
    if (d3Zoom) {
      if (userSelectionActive && !isZoomingOrPanning.current) {
        d3Zoom.on('zoom', null);
      } else if (!userSelectionActive) {
        d3Zoom.on('zoom', (event: D3ZoomEvent<HTMLDivElement, any>) => {
          const { onViewportChange } = store.getState();
          store.setState({ transform: [event.transform.x, event.transform.y, event.transform.k] });

          zoomedWithRightMouseButton.current = !!(
            onPaneContextMenu && isRightClickPan(panOnDrag, mouseButton.current ?? 0)
          );

          if (onMove || onViewportChange) {
            const flowTransform = eventToFlowTransform(event.transform);

            onViewportChange?.(flowTransform);
            onMove?.(event.sourceEvent as MouseEvent | TouchEvent, flowTransform);
          }
        });
      }
    }
  }, [userSelectionActive, d3Zoom, onMove, panOnDrag, onPaneContextMenu]);

  useEffect(() => {
    if (d3Zoom) {
      d3Zoom.on('end', (event: D3ZoomEvent<HTMLDivElement, any>) => {
        if (!event.sourceEvent) {
          return null;
        }
        const { onViewportChangeEnd } = store.getState();

        isZoomingOrPanning.current = false;
        store.setState({ paneDragging: false });

        if (
          onPaneContextMenu &&
          isRightClickPan(panOnDrag, mouseButton.current ?? 0) &&
          !zoomedWithRightMouseButton.current
        ) {
          onPaneContextMenu(event.sourceEvent);
        }
        zoomedWithRightMouseButton.current = false;

        if ((onMoveEnd || onViewportChangeEnd) && viewChanged(prevTransform.current, event.transform)) {
          const flowTransform = eventToFlowTransform(event.transform);
          prevTransform.current = flowTransform;

          clearTimeout(timerId.current);
          timerId.current = setTimeout(
            () => {
              onViewportChangeEnd?.(flowTransform);
              onMoveEnd?.(event.sourceEvent as MouseEvent | TouchEvent, flowTransform);
            },
            panOnScroll ? 150 : 0
          );
        }
      });
    }
  }, [d3Zoom, panOnScroll, panOnDrag, onMoveEnd, onPaneContextMenu]);

  useEffect(() => {
    if (d3Zoom) {
      d3Zoom.filter((event: any) => {
        const zoomScroll = zoomActivationKeyPressed || zoomOnScroll;
        const pinchZoom = zoomOnPinch && event.ctrlKey;

        if (
          event.button === 1 &&
          event.type === 'mousedown' &&
          (isWrappedWithClass(event, 'react-flow__node') || isWrappedWithClass(event, 'react-flow__edge'))
        ) {
          return true;
        }

        // if all interactions are disabled, we prevent all zoom events
        if (!panOnDrag && !zoomScroll && !panOnScroll && !zoomOnDoubleClick && !zoomOnPinch) {
          return false;
        }

        // during a selection we prevent all other interactions
        if (userSelectionActive) {
          return false;
        }

        // if zoom on double click is disabled, we prevent the double click event
        if (!zoomOnDoubleClick && event.type === 'dblclick') {
          return false;
        }

        // if the target element is inside an element with the nowheel class, we prevent zooming
        if (isWrappedWithClass(event, noWheelClassName) && event.type === 'wheel') {
          return false;
        }

        // if the target element is inside an element with the nopan class, we prevent panning
        if (isWrappedWithClass(event, noPanClassName) && event.type !== 'wheel') {
          return false;
        }

        if (!zoomOnPinch && event.ctrlKey && event.type === 'wheel') {
          return false;
        }

        // when there is no scroll handling enabled, we prevent all wheel events
        if (!zoomScroll && !panOnScroll && !pinchZoom && event.type === 'wheel') {
          return false;
        }

        // if the pane is not movable, we prevent dragging it with mousestart or touchstart
        if (!panOnDrag && (event.type === 'mousedown' || event.type === 'touchstart')) {
          return false;
        }

        // if the pane is only movable using allowed clicks
        if (
          Array.isArray(panOnDrag) &&
          !panOnDrag.includes(event.button) &&
          (event.type === 'mousedown' || event.type === 'touchstart')
        ) {
          return false;
        }

        // We only allow right clicks if pan on drag is set to right click
        const buttonAllowed =
          (Array.isArray(panOnDrag) && panOnDrag.includes(event.button)) || !event.button || event.button <= 1;

        // default filter for d3-zoom
        return (!event.ctrlKey || event.type === 'wheel') && buttonAllowed;
      });
    }
  }, [
    userSelectionActive,
    d3Zoom,
    zoomOnScroll,
    zoomOnPinch,
    panOnScroll,
    zoomOnDoubleClick,
    panOnDrag,
    elementsSelectable,
    zoomActivationKeyPressed,
  ]);

  return (
    <div className="react-flow__renderer" ref={zoomPane} style={containerStyle}>
      {children}
    </div>
  );
};

export default ZoomPane;
