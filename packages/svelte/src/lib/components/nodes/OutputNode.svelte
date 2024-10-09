<script lang="ts">
  import { Position } from '@xyflow/system';
  import type { NodeProps } from '$lib/types';

  import { Handle } from '$lib/components/Handle';

  type $$Props = NodeProps;

  export let data: $$Props['data'] = { label: 'Node' };
  export let targetPosition: $$Props['targetPosition'] = undefined;

  // this is a workaround for suppressing the warning about unused props
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  $$restProps;
</script>

{data?.label}
<Handle type="target" position={targetPosition ?? Position.Top} />
