<script lang="ts">
	import { Background, Controls, MiniMap, Panel, SvelteFlow } from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	let { flowConfig }: { flowConfig: FlowConfig } = $props();

	// Create writables here so it is easier to create test cases
	let nodes = $state.raw(flowConfig.flowProps?.nodes ?? []);
	let edges = $state.raw(flowConfig.flowProps?.edges ?? []);

	const flowProps = { ...flowConfig.flowProps };
</script>

<SvelteFlow bind:nodes bind:edges {...flowProps}>
	{#if flowConfig.panelProps}
		<Panel {...flowConfig.panelProps} />
	{/if}
	{#if flowConfig.minimapProps}
		<MiniMap {...flowConfig.minimapProps} />
	{/if}
	{#if flowConfig.controlsProps}
		<Controls {...flowConfig.controlsProps} />
	{/if}
	{#if flowConfig.backgroundProps}
		<Background {...flowConfig.backgroundProps} />
	{/if}
</SvelteFlow>
