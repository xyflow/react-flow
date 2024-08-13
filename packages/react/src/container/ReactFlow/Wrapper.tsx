import { useContext, type ReactNode } from 'react';

import StoreContext from '../../contexts/StoreContext';
import { ReactFlowProvider } from '../../components/ReactFlowProvider';
import type { Node, Edge } from '../../types';
import { NodeOrigin } from '@xyflow/system';

export function Wrapper({
  children,
  nodes,
  edges,
  defaultNodes,
  defaultEdges,
  width,
  height,
  fitView,
  nodeOrigin,
}: {
  children: ReactNode;
  nodes?: readonly Node[];
  edges?: readonly Edge[];
  defaultNodes?: readonly Node[];
  defaultEdges?: readonly Edge[];
  width?: number;
  height?: number;
  fitView?: boolean;
  nodeOrigin?: NodeOrigin;
}) {
  const isWrapped = useContext(StoreContext);

  if (isWrapped) {
    // we need to wrap it with a fragment because it's not allowed for children to be a ReactNode
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18051
    return <>{children}</>;
  }

  return (
    <ReactFlowProvider
      initialNodes={nodes}
      initialEdges={edges}
      defaultNodes={defaultNodes}
      defaultEdges={defaultEdges}
      initialWidth={width}
      initialHeight={height}
      fitView={fitView}
      nodeOrigin={nodeOrigin}
    >
      {children}
    </ReactFlowProvider>
  );
}
