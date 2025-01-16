import { useCallback } from "react";
import { shallowEdgeData } from '@xyflow/system';

import { useStore } from '../hooks/useStore';
import type { Edge } from '../types';

/**
 * Hook for receiving data of one or multiple edges
 *
 * @public
 * @param edgeId - The id (or ids) of the edge to get the data from
 * @param guard - Optional guard function to narrow down the edge type
 * @returns An object (or array of object) with {id, type, data} representing each edge
 */
export function useEdgesData<EdgeType extends Edge = Edge>(
  edgeId: string
): Pick<EdgeType, "id" | "type" | "data"> | null;
export function useEdgesData<EdgeType extends Edge = Edge>(
  edgeIds: string[]
): Pick<EdgeType, "id" | "type" | "data">[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEdgesData(edgeIds: any): any {
  const edgesData = useStore(
    useCallback(
      (s) => {
        const data = [];
        const isArrayOfIds = Array.isArray(edgeIds);
        const _edgeIds = isArrayOfIds ? edgeIds : [edgeIds];

        for (const edgeId of _edgeIds) {
          const edge = s.edgeLookup.get(edgeId);
          if (edge) {
            data.push({
              id: edge.id,
              type: edge.type,
              data: edge.data,
            });
          }
        }

        return isArrayOfIds ? data : data[0] ?? null;
      },
      [edgeIds]
    ),
    shallowEdgeData
  );

  return edgesData;
}


