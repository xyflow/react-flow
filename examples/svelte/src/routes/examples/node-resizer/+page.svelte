<script lang="ts">
	import { SvelteFlow, Controls, Panel, type Edge } from '@xyflow/svelte';

	import DefaultResizer from './DefaultResizer.svelte';
	import CustomResizer from './CustomResizer.svelte';
	import VerticalResizer from './VerticalResizer.svelte';
	import HorizontalResizer from './HorizontalResizer.svelte';

	import '@xyflow/svelte/dist/style.css';
	import type { ResizeNode } from './types';

	const nodeTypes = {
		defaultResizer: DefaultResizer,
		customResizer: CustomResizer,
		verticalResizer: VerticalResizer,
		horizontalResizer: HorizontalResizer
	};

	const nodeStyle = 'border: 1px solid #222; font-size: 10px; background-color: #ddd;';

	let edges = $state.raw<Edge[]>([]);

	let nodes = $state.raw<ResizeNode[]>([
		{
			id: '1',
			type: 'defaultResizer',
			data: { label: 'default resizer' },
			position: { x: 0, y: 0 },
			style: nodeStyle
		},
		{
			id: '1a',
			type: 'defaultResizer',
			data: {
				label: 'default resizer with min and max dimensions',
				minWidth: 100,
				minHeight: 80,
				maxWidth: 200,
				maxHeight: 200
			},
			position: { x: 0, y: 60 },
			style: nodeStyle + ' width: 100px; height: 80px;'
		},
		{
			id: '1b',
			type: 'defaultResizer',
			data: {
				label: 'default resizer with initial size and aspect ratio',
				keepAspectRatio: true,
				minWidth: 100,
				minHeight: 60,
				maxWidth: 400,
				maxHeight: 400
			},
			position: { x: 250, y: 0 },
			style: nodeStyle + ' width: 174px; height: 123px;'
		},
		{
			id: '2',
			type: 'customResizer',
			data: { label: 'custom resize icon' },
			position: { x: 0, y: 200 },
			style: nodeStyle + ' width: 100px; height: 60px;'
		},
		{
			id: '3',
			type: 'verticalResizer',
			data: { label: 'vertical resizer' },
			position: { x: 250, y: 200 },
			style: nodeStyle
		},
		{
			id: '3a',
			type: 'verticalResizer',
			data: {
				label: 'vertical resizer with min/maxHeight and aspect ratio',
				minHeight: 50,
				maxHeight: 200,
				keepAspectRatio: true
			},
			position: { x: 400, y: 200 },
			style: nodeStyle + ' height: 50px;'
		},
		{
			id: '4',
			type: 'horizontalResizer',
			data: {
				label: 'horizontal resizer with aspect ratio',
				keepAspectRatio: true,
				minHeight: 20,
				maxHeight: 80,
				maxWidth: 300
			},
			position: { x: 250, y: 300 },
			style: nodeStyle
		},
		{
			id: '4a',
			type: 'horizontalResizer',
			data: { label: 'horizontal resizer with maxWidth', maxWidth: 300 },
			position: { x: 250, y: 400 },
			style: nodeStyle
		},
		{
			id: '5',
			type: 'defaultResizer',
			data: { label: 'Parent' },
			position: { x: 700, y: 0 },
			style: nodeStyle + 'width: 300px; height: 300px'
		},
		{
			id: '5a',
			type: 'defaultResizer',
			data: { label: 'Child with extent parent' },
			position: { x: 50, y: 50 },
			parentId: '5',
			extent: 'parent',
			style: nodeStyle
		},
		{
			id: '5b',
			type: 'defaultResizer',
			data: { label: 'Child' },
			position: { x: 100, y: 100 },
			parentId: '5',
			style: nodeStyle
		}
	]);

	let snapToGrid = $state(false);
</script>

<SvelteFlow
	bind:nodes
	bind:edges
	{nodeTypes}
	minZoom={0.2}
	maxZoom={5}
	snapGrid={snapToGrid ? [10, 10] : undefined}
	fitView
	nodeOrigin={[0.5, 0.5]}
>
	<Controls />
	<Panel position="bottom-right">
		<button
			onclick={() => {
				snapToGrid = !snapToGrid;
			}}
		>
			snapToGrid: {snapToGrid ? 'on' : 'off'}
		</button>
	</Panel>
</SvelteFlow>
