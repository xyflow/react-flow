<script lang="ts">
  import { Position } from '@xyflow/system';
  import type { NodeProps } from '$lib/types';

  import { Handle } from '$lib/components/Handle';

  let { data = { label: 'Node' }, targetPosition = Position.Top }: NodeProps = $props();
</script>

{data?.label}
<Handle type="target" position={targetPosition} />
