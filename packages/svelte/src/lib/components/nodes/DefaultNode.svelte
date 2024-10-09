<script lang="ts">
  import { Position } from '@xyflow/system';

  import { Handle } from '$lib/components/Handle';
  import type { NodeProps } from '$lib/types';

  type $$Props = NodeProps;

  export let data: $$Props['data'] = { label: 'Node' };
  export let targetPosition: $$Props['targetPosition'] = undefined;
  export let sourcePosition: $$Props['sourcePosition'] = undefined;

  // this is a workaround for suppressing the warning about unused props
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  $$restProps;
</script>

<Handle type="target" position={targetPosition ?? Position.Top} />
{data?.label}
<Handle type="source" position={sourcePosition ?? Position.Bottom} />
