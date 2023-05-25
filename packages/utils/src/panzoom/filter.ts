import { isWrappedWithClass } from './utils';

export type FilterParams = {
  zoomActivationKeyPressed: boolean;
  zoomOnScroll: boolean;
  zoomOnPinch: boolean;
  panOnDrag: boolean | number[];
  panOnScroll: boolean;
  zoomOnDoubleClick: boolean;
  userSelectionActive: boolean;
  noWheelClassName: string;
  noPanClassName: string;
};

export function createFilter({
  zoomActivationKeyPressed,
  zoomOnScroll,
  zoomOnPinch,
  panOnDrag,
  panOnScroll,
  zoomOnDoubleClick,
  userSelectionActive,
  noWheelClassName,
  noPanClassName,
}: FilterParams) {
  return (event: any): boolean => {
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
  };
}
