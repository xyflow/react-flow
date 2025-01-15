<script lang="ts">
	import { SvelteFlowProvider } from '@xyflow/svelte';

	import Flow from './Flow.svelte';

	let {
		data
	}: {
		data: { flowConfig: FlowConfig };
	} = $props();
</script>

<SvelteFlowProvider>
	<Flow flowConfig={data.flowConfig} />
</SvelteFlowProvider>
