import { useStore } from '$lib/store';
import type { Edge, Node } from '$lib/types';
import type { Viewport } from '@xyflow/system';

/**
 * Hook for getting the current nodes from the store.
 *
 * @public
 * @returns reactive signal of the current edges
 */
export function useNodes() {
  const store = $derived(useStore());
  return {
    get current() {
      return store.nodes;
    },
    set current(nodes) {
      store.nodes = nodes;
    },
    update(updateFn: (nodes: Node[]) => Node[]) {
      store.nodes = updateFn(store.nodes);
    },
    set(nodes: Node[]) {
      store.nodes = nodes;
    }
  };
}

/**
 * Hook for getting the current edges from the store.
 *
 * @public
 * @returns reactive signal of the current edges
 */
export function useEdges() {
  const store = $derived(useStore());
  return {
    get current() {
      return store.edges;
    },
    set current(edges) {
      store.edges = edges;
    },
    update(updateFn: (edges: Edge[]) => Edge[]) {
      store.edges = updateFn(store.edges);
    },
    set(edges: Edge[]) {
      store.edges = edges;
    }
  };
}

/**
 * Hook for getting the current viewport from the store.
 *
 * @public
 * @returns reactive signal of the current viewport
 */
export function useViewport() {
  const store = $derived(useStore());
  return {
    get current() {
      return store.viewport;
    },
    set current(viewport: Viewport) {
      store.viewport = viewport;
    },
    update(updateFn: (viewport: Viewport) => Viewport) {
      store.viewport = updateFn(store.viewport);
    },
    set(viewport: Viewport) {
      store.viewport = viewport;
    }
  };
}
