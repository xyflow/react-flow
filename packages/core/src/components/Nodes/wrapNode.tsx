import React, { useEffect, useRef, memo, ComponentType, MouseEvent, KeyboardEvent } from 'react';
import cc from 'classcat';

import { useStoreApi } from '../../store';
import { Provider } from '../../contexts/NodeIdContext';
import { NodeProps, WrapNodeProps, XYPosition } from '../../types';
import useDrag from '../../hooks/useDrag';
import { getMouseHandler, handleNodeClick } from './utils';
import useUpdateNode from '../../hooks/useUpdateNode';

const arrowKeyDiffs: Record<string, XYPosition> = {
  ArrowUp: { x: 0, y: -10 },
  ArrowDown: { x: 0, y: 10 },
  ArrowLeft: { x: -10, y: 0 },
  ArrowRight: { x: 10, y: 0 },
};

export default (NodeComponent: ComponentType<NodeProps>) => {
  const NodeWrapper = ({
    id,
    type,
    data,
    xPos,
    yPos,
    selected,
    onClick,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onContextMenu,
    onDoubleClick,
    style,
    className,
    isDraggable,
    isSelectable,
    isConnectable,
    selectNodesOnDrag,
    sourcePosition,
    targetPosition,
    hidden,
    resizeObserver,
    dragHandle,
    zIndex,
    isParent,
    noPanClassName,
    noDragClassName,
    initialized,
  }: WrapNodeProps) => {
    const store = useStoreApi();
    const nodeRef = useRef<HTMLDivElement>(null);
    const prevSourcePosition = useRef(sourcePosition);
    const prevTargetPosition = useRef(targetPosition);
    const prevType = useRef(type);
    const hasPointerEvents = isSelectable || isDraggable || onClick || onMouseEnter || onMouseMove || onMouseLeave;
    const { updateSelected, updatePosition } = useUpdateNode();

    const onMouseEnterHandler = getMouseHandler(id, store.getState, onMouseEnter);
    const onMouseMoveHandler = getMouseHandler(id, store.getState, onMouseMove);
    const onMouseLeaveHandler = getMouseHandler(id, store.getState, onMouseLeave);
    const onContextMenuHandler = getMouseHandler(id, store.getState, onContextMenu);
    const onDoubleClickHandler = getMouseHandler(id, store.getState, onDoubleClick);
    const onSelectNodeHandler = (event: MouseEvent) => {
      if (isSelectable && (!selectNodesOnDrag || !isDraggable)) {
        // this handler gets called within the drag start event when selectNodesOnDrag=true
        handleNodeClick({
          id,
          store,
        });
      }

      if (onClick) {
        const node = store.getState().nodeInternals.get(id)!;
        onClick(event, { ...node });
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        updateSelected(id, true);
      } else if (arrowKeyDiffs[event.key]) {
        updatePosition(id, arrowKeyDiffs[event.key]);
      }
    };

    useEffect(() => {
      if (nodeRef.current && !hidden) {
        const currNode = nodeRef.current;
        resizeObserver?.observe(currNode);

        return () => resizeObserver?.unobserve(currNode);
      }
    }, [hidden]);

    useEffect(() => {
      // when the user programmatically changes the source or handle position, we re-initialize the node
      const typeChanged = prevType.current !== type;
      const sourcePosChanged = prevSourcePosition.current !== sourcePosition;
      const targetPosChanged = prevTargetPosition.current !== targetPosition;

      if (nodeRef.current && (typeChanged || sourcePosChanged || targetPosChanged)) {
        if (typeChanged) {
          prevType.current = type;
        }
        if (sourcePosChanged) {
          prevSourcePosition.current = sourcePosition;
        }
        if (targetPosChanged) {
          prevTargetPosition.current = targetPosition;
        }
        store.getState().updateNodeDimensions([{ id, nodeElement: nodeRef.current, forceUpdate: true }]);
      }
    }, [id, type, sourcePosition, targetPosition]);

    const dragging = useDrag({
      nodeRef,
      disabled: hidden || !isDraggable,
      noDragClassName,
      handleSelector: dragHandle,
      nodeId: id,
      isSelectable,
      selectNodesOnDrag,
    });

    if (hidden) {
      return null;
    }

    return (
      <div
        className={cc([
          'react-flow__node',
          `react-flow__node-${type}`,
          noPanClassName,
          className,
          {
            selected,
            selectable: isSelectable,
            parent: isParent,
          },
        ])}
        ref={nodeRef}
        style={{
          zIndex,
          transform: `translate(${xPos}px,${yPos}px)`,
          pointerEvents: hasPointerEvents ? 'all' : 'none',
          visibility: initialized ? 'visible' : 'hidden',
          ...style,
        }}
        onMouseEnter={onMouseEnterHandler}
        onMouseMove={onMouseMoveHandler}
        onMouseLeave={onMouseLeaveHandler}
        onContextMenu={onContextMenuHandler}
        onClick={onSelectNodeHandler}
        onDoubleClick={onDoubleClickHandler}
        onKeyDown={onKeyDown}
        data-id={id}
        tabIndex={0}
      >
        <Provider value={id}>
          <NodeComponent
            id={id}
            data={data}
            type={type}
            xPos={xPos}
            yPos={yPos}
            selected={selected}
            isConnectable={isConnectable}
            sourcePosition={sourcePosition}
            targetPosition={targetPosition}
            dragging={dragging}
            dragHandle={dragHandle}
            zIndex={zIndex}
          />
        </Provider>
      </div>
    );
  };

  NodeWrapper.displayName = 'NodeWrapper';

  return memo(NodeWrapper);
};
