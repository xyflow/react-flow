<script lang="ts">
	const onDragStart = (event: DragEvent, nodeType: string) => {
		if (!event.dataTransfer) {
			return null;
		}

		event.dataTransfer.setData('application/svelteflow', nodeType);
		event.dataTransfer.effectAllowed = 'move';
	};
</script>

<aside>
	<div class="label">You can drag these nodes to the pane on the left.</div>
	<div
		class="input-node node"
		ondragstart={(event) => onDragStart(event, 'input')}
		draggable={true}
	>
		Input Node
	</div>
	<div
		class="default-node node"
		ondragstart={(event) => onDragStart(event, 'default')}
		draggable={true}
	>
		Default Node
	</div>
	<div
		class="output-node node"
		ondragstart={(event) => onDragStart(event, 'output')}
		draggable={true}
	>
		Output Node
	</div>
</aside>

<style>
	.label {
		margin: 0.5rem 0 0.25rem 0;
	}

	aside {
		width: 20vw;
		background: #f4f4f4;
		padding: 0.4rem 0.8rem;
		font-size: 12px;
	}

	.node {
		margin-bottom: 0.5rem;
		border: 1px solid #111;
		padding: 0.5rem 1rem;
		font-weight: 700;
		border-radius: 3px;
		cursor: grab;
	}
</style>
