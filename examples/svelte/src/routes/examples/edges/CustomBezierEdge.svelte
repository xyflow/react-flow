<script lang="ts">
	import { BezierEdge, type EdgeProps } from '@xyflow/svelte';

	type $$Props = EdgeProps;



	interface Props {
		label?: $$Props['label'];
		labelStyle?: $$Props['labelStyle'];
		style?: $$Props['style'];
		markerStart?: $$Props['markerStart'];
		markerEnd?: $$Props['markerEnd'];
		interactionWidth?: $$Props['interactionWidth'];
		sourceX: $$Props['sourceX'];
		sourceY: $$Props['sourceY'];
		sourcePosition: $$Props['sourcePosition'];
		targetX: $$Props['targetX'];
		targetY: $$Props['targetY'];
		targetPosition: $$Props['targetPosition'];
		[key: string]: any
	}

	let {
		label = undefined,
		labelStyle = undefined,
		style = undefined,
		markerStart = undefined,
		markerEnd = undefined,
		interactionWidth = undefined,
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
		...rest
	}: Props = $props();

	rest;
</script>

<BezierEdge
	{sourceX}
	{sourceY}
	{sourcePosition}
	{targetX}
	{targetY}
	{targetPosition}
	{label}
	{labelStyle}
	{markerStart}
	{markerEnd}
	{style}
	{interactionWidth}
	pathOptions={{ curvature: 1 }}
/>
