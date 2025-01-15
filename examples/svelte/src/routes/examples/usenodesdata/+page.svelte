<script module lang="ts">
	import type { Node } from '@xyflow/svelte';

	type TextNodeType = Node<{ text: string }, 'text'>;
	type UppercaseNodeType = Node<{ text: string }, 'uppercase'>;
	type ResultNodeType = Node<{}, 'result'>;

	export function isTextNode(node: any): node is TextNodeType | UppercaseNode {
		return !node || !node.type ? false : node.type === 'text' || node.type === 'uppercase';
	}

	export type MyNode = TextNodeType | UppercaseNodeType | ResultNodeType;
</script>

<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		type NodeTypes,
		type Edge
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

	import TextNode from './TextNode.svelte';
	import UppercaseNode from './UppercaseNode.svelte';
	import ResultNode from './ResultNode.svelte';

	const nodeTypes: NodeTypes = {
		text: TextNode,
		uppercase: UppercaseNode,
		result: ResultNode
	};

	let nodes = $state.raw<MyNode[]>([
		{
			id: '1',
			type: 'text',
			data: {
				text: 'hello'
			},
			position: { x: -100, y: -50 }
		},
		{
			id: '1a',
			type: 'uppercase',
			data: {
				text: ''
			},
			position: { x: 100, y: 0 }
		},
		{
			id: '2',
			type: 'text',
			data: {
				text: 'world'
			},
			position: { x: 0, y: 100 }
		},
		{
			id: '3',
			type: 'result',
			data: {},
			position: { x: 300, y: 50 }
		}
	]);

	let edges = $state.raw<Edge[]>([
		{
			id: 'e1-1a',
			source: '1',
			target: '1a'
		},
		{
			id: 'e1a-3',
			source: '1a',
			target: '3'
		},
		{
			id: 'e2-3',
			source: '2',
			target: '3'
		}
	]);
</script>

<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView>
	<Controls />
	<Background variant={BackgroundVariant.Dots} />
	<MiniMap />
</SvelteFlow>
