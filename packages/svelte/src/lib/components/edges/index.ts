// We distinguish between internal and exported edges
// The internal edges are used directly like custom edges and always get an id, source and target props
// If you import an edge from the library, the id is optional and source and target are not used at all

// @todo: how can we prevent this duplication in ...Edge/ ...EdgeInternal?
// both are quite similar, it's just about 1-2 props that are different
export { default as BezierEdge } from './BezierEdge.svelte';
export { default as BezierEdgeInternal } from './BezierEdge.svelte';

export { default as SmoothStepEdge } from './SmoothStepEdge.svelte';
export { default as SmoothStepEdgeInternal } from './SmoothStepEdgeInternal.svelte';

export { default as StraightEdge } from './StraightEdge.svelte';
export { default as StraightEdgeInternal } from './StraightEdgeInternal.svelte';

export { default as StepEdge } from './StepEdge.svelte';
export { default as StepEdgeInternal } from './StepEdgeInternal.svelte';

export { default as BaseEdge } from './BaseEdge.svelte';
