<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Panel,
		PanOnScrollMode,
		MiniMap,
		type OnMoveEnd,
		type Node,
		type Edge
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';

	let nodes = $state.raw([
		{
			id: '1',
			type: 'input',
			data: { label: 'Node 1' },
			position: { x: 250, y: 5 }
		},
		{ id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
		{ id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },
		{ id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 } }
	]);

	let edges = $state.raw([
		{ id: 'e1-2', source: '1', target: '2', animated: true },
		{ id: 'e1-3', source: '1', target: '3' }
	]);

	const onNodeDragStart = (_: MouseEvent, node: Node) => console.log('drag start', node);
	const onNodeDragStop = (_: MouseEvent, node: Node) => console.log('drag stop', node);
	const onNodeClick = (_: MouseEvent, node: Node) => console.log('click', node);
	const onEdgeClick = (_: MouseEvent, edge: Edge) => console.log('click', edge);
	const onPaneClick = (event: MouseEvent) => console.log('onPaneClick', event);
	const onPaneScroll = (event?: WheelEvent) => console.log('onPaneScroll', event);
	const onPaneContextMenu = (event: MouseEvent) => console.log('onPaneContextMenu', event);
	const onMoveEnd: OnMoveEnd = (_, viewport) => console.log('onMoveEnd', viewport);

	let isSelectable = $state(false);
	let isDraggable = $state(false);
	let isConnectable = $state(false);
	let zoomOnScroll = $state(false);
	let zoomOnPinch = $state(false);
	let panOnScroll = $state(false);
	let panOnScrollMode = $state(PanOnScrollMode.Free);
	let zoomOnDoubleClick = $state(false);
	let panOnDrag = $state(true);
	let captureZoomClick = $state(false);
	let captureZoomScroll = $state(false);
	let captureElementClick = $state(false);
</script>

<SvelteFlow
	bind:nodes
	bind:edges
	elementsSelectable={isSelectable}
	nodesConnectable={isConnectable}
	nodesDraggable={isDraggable}
	{zoomOnScroll}
	{zoomOnPinch}
	{panOnScroll}
	{panOnScrollMode}
	{zoomOnDoubleClick}
	{panOnDrag}
	{onMoveEnd}
	fitView
>
	<MiniMap />
	<Controls />

	<Panel position="top-right">
		<div>
			<label for="draggable">
				nodesDraggable
				<input
					id="draggable"
					type="checkbox"
					bind:checked={isDraggable}
					class="svelte-flow__draggable"
				/>
			</label>
		</div>
		<div>
			<label for="connectable">
				nodesConnectable
				<input
					id="connectable"
					type="checkbox"
					bind:checked={isConnectable}
					class="svelte-flow__connectable"
				/>
			</label>
		</div>
		<div>
			<label for="selectable">
				elementsSelectable
				<input
					id="selectable"
					type="checkbox"
					bind:checked={isSelectable}
					class="svelte-flow__selectable"
				/>
			</label>
		</div>
		<div>
			<label for="zoomonscroll">
				zoomOnScroll
				<input
					id="zoomonscroll"
					type="checkbox"
					bind:checked={zoomOnScroll}
					class="svelte-flow__zoomonscroll"
				/>
			</label>
		</div>
		<div>
			<label for="zoomonpinch">
				zoomOnPinch
				<input
					id="zoomonpinch"
					type="checkbox"
					bind:checked={zoomOnPinch}
					class="svelte-flow__zoomonpinch"
				/>
			</label>
		</div>
		<div>
			<label for="panonscroll">
				panOnScroll
				<input
					id="panonscroll"
					type="checkbox"
					bind:checked={panOnScroll}
					class="svelte-flow__panonscroll"
				/>
			</label>
		</div>
		<div>
			<label for="panonscrollmode">
				panOnScrollMode
				<select
					id="panonscrollmode"
					bind:value={panOnScrollMode}
					onchange={(event) => {
						panOnScrollMode = PanOnScrollMode.Free;
					}}
					class="svelte-flow__panonscrollmode"
				>
					<option value="free">free</option>
					<option value="horizontal">horizontal</option>
					<option value="vertical">vertical</option>
				</select>
			</label>
		</div>
		<div>
			<label for="zoomondbl">
				zoomOnDoubleClick
				<input
					id="zoomondbl"
					type="checkbox"
					bind:checked={zoomOnDoubleClick}
					class="svelte-flow__zoomondbl"
				/>
			</label>
		</div>
		<div>
			<label for="panondrag">
				panOnDrag
				<input
					id="panondrag"
					type="checkbox"
					bind:checked={panOnDrag}
					class="svelte-flow__panondrag"
				/>
			</label>
		</div>
		<div>
			<label for="capturezoompaneclick">
				capture onPaneClick
				<input
					id="capturezoompaneclick"
					type="checkbox"
					bind:checked={captureZoomClick}
					class="svelte-flow__capturezoompaneclick"
				/>
			</label>
		</div>
		<div>
			<label for="capturezoompanescroll">
				capture onPaneScroll
				<input
					id="capturezoompanescroll"
					type="checkbox"
					bind:checked={captureZoomScroll}
					class="svelte-flow__capturezoompanescroll"
				/>
			</label>
		</div>
		<div>
			<label for="captureelementclick">
				capture onElementClick
				<input
					id="captureelementclick"
					type="checkbox"
					bind:checked={captureElementClick}
					class="svelte-flow__captureelementclick"
				/>
			</label>
		</div>
	</Panel>
</SvelteFlow>
