import { get, type Writable } from 'svelte/store';
import {
  pointToRendererPoint,
  type FitBoundsOptions,
  type Project,
  type SetCenterOptions,
  type Viewport,
  type ViewportHelperFunctionOptions,
  type XYPosition,
  type ZoomInOut,
  type Rect,
  getTransformForBounds,
  getElementsToRemove
} from '@xyflow/system';

import { useStore } from '$lib/store';
import type { Edge, FitViewOptions, Node } from '$lib/types';

export function useSvelteFlow(): {
  zoomIn: ZoomInOut;
  zoomOut: ZoomInOut;
  setZoom: (zoomLevel: number, options?: ViewportHelperFunctionOptions) => void;
  getZoom: () => number;
  setCenter: (x: number, y: number, options?: SetCenterOptions) => void;
  setViewport: (viewport: Viewport, options?: ViewportHelperFunctionOptions) => void;
  getViewport: () => Viewport;
  fitView: (options?: FitViewOptions) => void;
  fitBounds: (bounds: Rect, options?: FitBoundsOptions) => void;
  deleteElements: (
    nodesToRemove?: Partial<Node> & { id: string }[],
    edgesToRemove?: Partial<Edge> & { id: string }[]
  ) => { deletedNodes: Node[]; deletedEdges: Edge[] };
  project: Project;
  viewport: Writable<Viewport>;
} {
  const {
    zoomIn,
    zoomOut,
    fitView,
    snapGrid,
    viewport,
    width,
    height,
    minZoom,
    maxZoom,
    panZoom,
    nodes,
    edges
  } = useStore();

  return {
    zoomIn,
    zoomOut,
    setZoom: (zoomLevel, options) => {
      get(panZoom)?.scaleTo(zoomLevel, { duration: options?.duration });
    },
    getZoom: () => get(viewport).zoom,
    setViewport: (vieport, options) => {
      const currentViewport = get(viewport);

      get(panZoom)?.setViewport(
        {
          x: vieport.x ?? currentViewport.x,
          y: vieport.y ?? currentViewport.y,
          zoom: vieport.zoom ?? currentViewport.zoom
        },
        { duration: options?.duration }
      );
    },
    getViewport: () => get(viewport),
    setCenter: (x, y, options) => {
      const _width = get(width);
      const _height = get(height);
      const _maxZoom = get(maxZoom);

      const nextZoom = typeof options?.zoom !== 'undefined' ? options.zoom : _maxZoom;

      get(panZoom)?.setViewport(
        {
          x: _width / 2 - x * nextZoom,
          y: _height / 2 - y * nextZoom,
          zoom: nextZoom
        },
        { duration: options?.duration }
      );
    },
    fitView,
    fitBounds: (bounds: Rect, options?: FitBoundsOptions) => {
      const _width = get(width);
      const _height = get(height);
      const _maxZoom = get(maxZoom);
      const _minZoom = get(minZoom);

      const [x, y, zoom] = getTransformForBounds(
        bounds,
        _width,
        _height,
        _minZoom,
        _maxZoom,
        options?.padding ?? 0.1
      );

      get(panZoom)?.setViewport(
        {
          x,
          y,
          zoom
        },
        { duration: options?.duration }
      );
    },
    deleteElements: (
      nodesToRemove: Partial<Node> & { id: string }[] = [],
      edgesToRemove: Partial<Edge> & { id: string }[] = []
    ) => {
      const _nodes = get(nodes);
      const _edges = get(edges);
      const { matchingNodes, matchingEdges } = getElementsToRemove<Node, Edge>({
        nodesToRemove,
        edgesToRemove,
        nodes: _nodes,
        edges: _edges
      });

      if (matchingNodes) {
        nodes.set(_nodes.filter((node) => !matchingNodes.some(({ id }) => id === node.id)));
      }

      if (matchingEdges) {
        edges.set(_edges.filter((edge) => !matchingEdges.some(({ id }) => id === edge.id)));
      }

      return {
        deletedNodes: matchingNodes,
        deletedEdges: matchingEdges
      };
    },
    project: (position: XYPosition) => {
      const _snapGrid = get(snapGrid);
      const { x, y, zoom } = get(viewport);

      return pointToRendererPoint(position, [x, y, zoom], _snapGrid !== null, _snapGrid || [1, 1]);
    },
    viewport: viewport
  };
}
