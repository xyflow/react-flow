<script lang="ts">
  import { Position } from '@xyflow/system';

  import { Handle } from '$lib/components/Handle';
  import type { NodeProps } from '$lib/types';

  let {
    // TODO: do we really want this!?
    data = { label: 'Node' },
    targetPosition = Position.Top,
    sourcePosition = Position.Bottom
  }: NodeProps = $props();
</script>

<Handle type="target" position={targetPosition} />
{data?.label}
<Handle type="source" position={sourcePosition} />
