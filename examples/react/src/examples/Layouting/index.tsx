import { useCallback } from 'react';
import dagre from 'dagre';
import {
  ReactFlow,
  Controls,
  ReactFlowProvider,
  addEdge,
  Connection,
  CoordinateExtent,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
  EdgeMarker,
  Panel,
  useReactFlow,
} from '@xyflow/react';

import initialItems from './initial-elements';

import styles from './layouting.module.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeExtent: CoordinateExtent = [
  [0, 0],
  [1000, 1000],
];

const LayoutFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialItems.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialItems.edges);
  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const onLayout = (direction: string) => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 50 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? Position.Left : Position.Top;
      node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
      // we need to pass a slightly different position in order to notify react flow about the change
      // @TODO how can we change the position handling so that we dont need this hack?
      node.position = {
        x: nodeWithPosition.x + Math.random() / 1000,
        y: nodeWithPosition.y,
      };

      return node;
    });

    setNodes(layoutedNodes);
  };

  const unselect = () => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
  };

  const changeMarker = () => {
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        markerEnd: {
          type: (e.markerEnd as EdgeMarker)?.type === MarkerType.Arrow ? MarkerType.ArrowClosed : MarkerType.Arrow,
        },
      }))
    );
  };

  return (
    <div className={styles.layoutflow}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        nodeExtent={nodeExtent}
        onInit={() => onLayout('TB')}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Controls />
      </ReactFlow>
      <Panel position="top-right">
        <button onClick={() => onLayout('TB')}>vertical layout</button>
        <button onClick={() => onLayout('LR')}>horizontal layout</button>
        <button onClick={() => unselect()}>unselect nodes</button>
        <button onClick={() => changeMarker()}>change marker</button>
        <button onClick={() => fitView()}>fitView</button>
        <button onClick={() => fitView({ nodes: nodes.slice(0, 2) })}>fitView partially</button>
      </Panel>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <LayoutFlow />
  </ReactFlowProvider>
);
