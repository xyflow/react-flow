import {
  PanOnScrollMode,
  XYPanZoom,
  type CoordinateExtent,
  type OnPanZoom,
  type PanZoomInstance,
  type Transform,
  type Viewport
} from '@xyflow/system';

type ZoomParams = {
  viewport: Viewport;
  initialViewport: Viewport;
  minZoom: number;
  maxZoom: number;
  setPanZoomInstance: (panZoomInstance: PanZoomInstance) => void;
  onPanZoomStart?: OnPanZoom;
  onPanZoom?: OnPanZoom;
  onPanZoomEnd?: OnPanZoom;
  onPaneContextMenu?: (event: MouseEvent) => void;
  translateExtent: CoordinateExtent;
  zoomOnScroll: boolean;
  zoomOnPinch: boolean;
  zoomOnDoubleClick: boolean;
  panOnScroll: boolean;
  panOnDrag: boolean | number[];
  panOnScrollSpeed: number;
  panOnScrollMode: PanOnScrollMode;
  zoomActivationKeyPressed: boolean;
  preventScrolling: boolean;
  // last two instances of 'classname' being used
  // changing it to class would require object restructuring for use with panZoomInstance.update
  noPanClassName: string;
  noWheelClassName: string;
  userSelectionActive: boolean;
  lib: string;
  paneClickDistance: number;
  onTransformChange: (transform: Transform) => void;
  onDraggingChange: (dragging: boolean) => void;
};

export default function zoom(domNode: Element, params: ZoomParams) {
  const {
    minZoom,
    maxZoom,
    initialViewport,
    translateExtent,
    paneClickDistance,
    setPanZoomInstance,
    onDraggingChange,
    onTransformChange
  } = params;

  const panZoomInstance = XYPanZoom({
    domNode,
    minZoom,
    maxZoom,
    translateExtent,
    viewport: initialViewport,
    paneClickDistance,
    onDraggingChange
  });

  //TODO: is this neccessary?
  const viewport = panZoomInstance.getViewport();
  if (
    initialViewport.x !== viewport.x ||
    initialViewport.y !== viewport.y ||
    initialViewport.zoom !== viewport.zoom
  ) {
    onTransformChange([viewport.x, viewport.y, viewport.zoom]);
  }

  setPanZoomInstance(panZoomInstance);

  panZoomInstance.update(params);

  return {
    update(params: ZoomParams) {
      panZoomInstance.update(params);
    }
  };
}
