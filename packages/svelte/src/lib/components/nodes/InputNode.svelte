<script lang="ts">
  import { Position } from '@xyflow/system';
  import type { NodeProps } from '$lib/types';

  import { Handle } from '$lib/components/Handle';

  let { data = { label: 'Node' }, sourcePosition = Position.Bottom }: NodeProps = $props();
</script>

{data?.label}
<Handle type="source" position={sourcePosition} />
