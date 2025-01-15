import type { Component } from 'svelte';
import type { InternalNodeBase, NodeBase, NodeProps as NodePropsBase } from '@xyflow/system';

/**
 * The node data structure that gets used for internal nodes.
 * There are some data structures added under node.internal
 * that are needed for tracking some properties
 * @public
 */
export type InternalNode<NodeType extends Node = Node> = InternalNodeBase<NodeType>;

/**
 * The node data structure that gets used for the nodes prop.
 * @public
 */
export type Node<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  NodeType extends string = string
> = NodeBase<NodeData, NodeType> & {
  class?: string;
  style?: string;
};

// @todo: currently generics for nodes are not really supported
// let's fix `type: any` when we migrate to Svelte 5
export type NodeProps<NodeType extends Node = Node> = NodePropsBase<NodeType> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any;
};

export type NodeTypes = Record<
  string,
  Component<
    NodeProps & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: any;
    }
  >
>;

export type BuiltInNode =
  | Node<{ label: string }, 'input' | 'output' | 'default'>
  | Node<Record<string, never>, 'group'>;
