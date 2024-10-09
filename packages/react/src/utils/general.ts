import { PropsWithoutRef, type Ref, type RefAttributes, forwardRef } from 'react';
import { isNodeBase, isEdgeBase } from '@xyflow/system';

import type { Edge, Node } from '../types';

/**
 * Test whether an object is useable as a Node
 * @public
 * @remarks In TypeScript this is a type guard that will narrow the type of whatever you pass in to Node if it returns true
 * @param element - The element to test
 * @returns A boolean indicating whether the element is an Node
 */
export const isNode = <NodeType extends Node = Node>(element: unknown): element is NodeType =>
  isNodeBase<NodeType>(element);

/**
 * Test whether an object is useable as an Edge
 * @public
 * @remarks In TypeScript this is a type guard that will narrow the type of whatever you pass in to Edge if it returns true
 * @param element - The element to test
 * @returns A boolean indicating whether the element is an Edge
 */
export const isEdge = <EdgeType extends Edge = Edge>(element: unknown): element is EdgeType =>
  isEdgeBase<EdgeType>(element);

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function fixedForwardRef<T, P = {}>(
  render: (props: PropsWithoutRef<P>, ref: Ref<T>) => JSX.Element
): (props: P & RefAttributes<T>) => JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return forwardRef<T, P>(render) as any;
}
