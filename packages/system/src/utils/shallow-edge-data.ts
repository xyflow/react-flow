import { EdgeBase } from '../types';

type EdgeData = Pick<EdgeBase, "id" | "type" | "data">;

export function shallowEdgeData(
  a: EdgeData | EdgeData[] | null,
  b: EdgeData | EdgeData[] | null
) {
  if (a === null || b === null) {
    return false;
  }

  const _a = Array.isArray(a) ? a : [a];
  const _b = Array.isArray(b) ? b : [b];

  if (_a.length !== _b.length) {
    return false;
  }

  for (let i = 0; i < _a.length; i++) {
    if (
      _a[i].id !== _b[i].id ||
      _a[i].type !== _b[i].type ||
      !Object.is(_a[i].data, _b[i].data)
    ) {
      return false;
    }
  }

  return true;
}