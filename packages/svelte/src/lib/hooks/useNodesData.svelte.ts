import { shallowNodeData } from '@xyflow/system';

import type { Node } from '$lib/types';
import { useStore } from '$lib/store';

/**
 * Hook for receiving data of one or multiple nodes
 *
 * @public
 * @param nodeId - The id (or ids) of the node to get the data from
 * @returns A readable store with an array of data objects
 */
export function useNodesData<NodeType extends Node = Node>(
  nodeId: string
): { current: Pick<NodeType, 'id' | 'data' | 'type'> | null };
export function useNodesData<NodeType extends Node = Node>(
  nodeIds: string[]
): { current: Pick<NodeType, 'id' | 'data' | 'type'>[] };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useNodesData(nodeIds: any): any {
  const { nodes, nodeLookup } = $derived(useStore());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prevNodesData: any[] = [];
  let initialRun = true;

  const nodeData = $derived.by(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    nodes;
    const nextNodesData = [];
    const isArrayOfIds = Array.isArray(nodeIds);
    const _nodeIds = isArrayOfIds ? nodeIds : [nodeIds];

    for (const nodeId of _nodeIds) {
      const node = nodeLookup.get(nodeId)?.internals.userNode;
      if (node) {
        nextNodesData.push({
          id: node.id,
          type: node.type,
          data: node.data
        });
      }
    }

    if (!shallowNodeData(nextNodesData, prevNodesData) || initialRun) {
      prevNodesData = nextNodesData;
      initialRun = false;
    }

    return isArrayOfIds ? prevNodesData : (prevNodesData[0] ?? null);
  });

  return {
    get current() {
      return nodeData;
    }
  };
}
