import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import type {
  BaseNode,
  NodeDragItem,
  UseDragEvent,
  XYPosition,
  BaseEdge,
  CoordinateExtent,
  NodeOrigin,
  OnError,
  SnapGrid,
  Transform,
  PanBy,
  OnNodeDrag,
  OnSelectionDrag,
  UpdateNodePositions,
} from '@reactflow/system';

import { calcAutoPan, getEventPosition, getPointerPosition, calcNextPosition } from '../';
import { getDragItems, getEventHandlerParams, hasSelector, wrapSelectionDragFunc } from './utils';

export type OnDrag = (event: MouseEvent, dragItems: NodeDragItem[], node: BaseNode, nodes: BaseNode[]) => void;

type StoreItems = {
  nodes: BaseNode[];
  edges: BaseEdge[];
  nodeExtent: CoordinateExtent;
  snapGrid: SnapGrid;
  snapToGrid: boolean;
  nodeOrigin: NodeOrigin;
  multiSelectionActive: boolean;
  domNode?: Element | null;
  transform: Transform;
  autoPanOnNodeDrag: boolean;
  nodesDraggable: boolean;
  selectNodesOnDrag: boolean;
  panBy: PanBy;
  unselectNodesAndEdges: () => void;
  onError?: OnError;
  onNodeDragStart?: OnNodeDrag;
  onNodeDrag?: OnNodeDrag;
  onNodeDragStop?: OnNodeDrag;
  onSelectionDragStart?: OnSelectionDrag;
  onSelectionDrag?: OnSelectionDrag;
  onSelectionDragStop?: OnSelectionDrag;
  updateNodePositions: UpdateNodePositions;
};

export type XYDragParams = {
  domNode: Element;
  getStoreItems: () => StoreItems;
  onDragStart?: OnDrag;
  onDrag?: OnDrag;
  onDragStop?: OnDrag;
  onNodeClick?: () => void;
};

export type XYDragInstance = {
  update: (params: DragUpdateParams) => void;
  destroy: () => void;
};

export type DragUpdateParams = {
  noDragClassName?: string;
  handleSelector?: string;
  isSelectable?: boolean;
  nodeId?: string;
  domNode: Element;
};

export function XYDrag({
  domNode,
  onNodeClick,
  getStoreItems,
  onDragStart,
  onDrag,
  onDragStop,
}: XYDragParams): XYDragInstance {
  let lastPos: { x: number | null; y: number | null } = { x: null, y: null };
  let autoPanId = 0;
  let dragItems: NodeDragItem[] = [];
  let autoPanStarted = false;
  let mousePosition: XYPosition = { x: 0, y: 0 };
  let dragEvent: MouseEvent | null = null;
  let containerBounds: DOMRect | null = null;

  const d3Selection = select(domNode);

  // public functions
  function update({ noDragClassName, handleSelector, domNode, isSelectable, nodeId }: DragUpdateParams) {
    function updateNodes({ x, y }: XYPosition) {
      const {
        nodes,
        nodeExtent,
        snapGrid,
        snapToGrid,
        nodeOrigin,
        onNodeDrag,
        onSelectionDrag,
        onError,
        updateNodePositions,
      } = getStoreItems();

      lastPos = { x, y };

      let hasChange = false;

      dragItems = dragItems.map((n) => {
        const nextPosition = { x: x - n.distance.x, y: y - n.distance.y };

        if (snapToGrid) {
          nextPosition.x = snapGrid[0] * Math.round(nextPosition.x / snapGrid[0]);
          nextPosition.y = snapGrid[1] * Math.round(nextPosition.y / snapGrid[1]);
        }

        const updatedPos = calcNextPosition(n, nextPosition, nodes, nodeExtent, nodeOrigin, onError);

        // we want to make sure that we only fire a change event when there is a changes
        hasChange = hasChange || n.position.x !== updatedPos.position.x || n.position.y !== updatedPos.position.y;

        n.position = updatedPos.position;
        n.positionAbsolute = updatedPos.positionAbsolute;

        return n;
      });

      if (!hasChange) {
        return;
      }

      updateNodePositions(dragItems, true, true);
      const onNodeOrSelectionDrag = nodeId ? onNodeDrag : wrapSelectionDragFunc(onSelectionDrag);

      if (dragEvent) {
        const [currentNode, currentNodes] = getEventHandlerParams({
          nodeId,
          dragItems,
          nodes,
        });
        onDrag?.(dragEvent as MouseEvent, dragItems, currentNode, currentNodes);
        onNodeOrSelectionDrag?.(dragEvent as MouseEvent, currentNode, currentNodes);
      }
    }

    function autoPan() {
      if (!containerBounds) {
        return;
      }

      const [xMovement, yMovement] = calcAutoPan(mousePosition, containerBounds);

      if (xMovement !== 0 || yMovement !== 0) {
        const { transform, panBy } = getStoreItems();

        lastPos.x = (lastPos.x ?? 0) - xMovement / transform[2];
        lastPos.y = (lastPos.y ?? 0) - yMovement / transform[2];

        if (panBy({ x: xMovement, y: yMovement })) {
          updateNodes(lastPos as XYPosition);
        }
      }
      autoPanId = requestAnimationFrame(autoPan);
    }

    const d3DragInstance = drag()
      .on('start', (event: UseDragEvent) => {
        const {
          nodes,
          multiSelectionActive,
          domNode,
          nodesDraggable,
          transform,
          snapGrid,
          snapToGrid,
          onNodeDragStart,
          onSelectionDragStart,
          unselectNodesAndEdges,
          selectNodesOnDrag,
        } = getStoreItems();

        if (!selectNodesOnDrag && !multiSelectionActive && nodeId) {
          if (!nodes.find((n) => n.id === nodeId)?.selected) {
            // we need to reset selected nodes when selectNodesOnDrag=false
            unselectNodesAndEdges();
          }
        }

        if (isSelectable && selectNodesOnDrag) {
          onNodeClick?.();
        }

        const pointerPos = getPointerPosition(event.sourceEvent, { transform, snapGrid, snapToGrid });
        lastPos = pointerPos;
        dragItems = getDragItems(nodes, nodesDraggable, pointerPos, nodeId);

        const onNodeOrSelectionDragStart = nodeId ? onNodeDragStart : wrapSelectionDragFunc(onSelectionDragStart);

        if (dragItems) {
          const [currentNode, currentNodes] = getEventHandlerParams({
            nodeId,
            dragItems,
            nodes,
          });
          onDragStart?.(event.sourceEvent as MouseEvent, dragItems, currentNode, currentNodes);
          onNodeOrSelectionDragStart?.(event.sourceEvent as MouseEvent, currentNode, currentNodes);
        }

        containerBounds = domNode?.getBoundingClientRect() || null;
        mousePosition = getEventPosition(event.sourceEvent, containerBounds!);
      })
      .on('drag', (event: UseDragEvent) => {
        const { autoPanOnNodeDrag, transform, snapGrid, snapToGrid } = getStoreItems();
        const pointerPos = getPointerPosition(event.sourceEvent, { transform, snapGrid, snapToGrid });

        if (!autoPanStarted && autoPanOnNodeDrag) {
          autoPanStarted = true;
          autoPan();
        }

        // skip events without movement
        if ((lastPos.x !== pointerPos.xSnapped || lastPos.y !== pointerPos.ySnapped) && dragItems) {
          dragEvent = event.sourceEvent as MouseEvent;
          mousePosition = getEventPosition(event.sourceEvent, containerBounds!);

          updateNodes(pointerPos);
        }
      })
      .on('end', (event: UseDragEvent) => {
        autoPanStarted = false;
        cancelAnimationFrame(autoPanId);

        if (dragItems) {
          const { nodes, updateNodePositions, onNodeDragStop, onSelectionDragStop } = getStoreItems();
          const onNodeOrSelectionDragStop = nodeId ? onNodeDragStop : wrapSelectionDragFunc(onSelectionDragStop);

          updateNodePositions(dragItems, false, false);

          const [currentNode, currentNodes] = getEventHandlerParams({
            nodeId,
            dragItems,
            nodes,
          });
          onDragStop?.(event.sourceEvent as MouseEvent, dragItems, currentNode, currentNodes);
          onNodeOrSelectionDragStop?.(event.sourceEvent as MouseEvent, currentNode, currentNodes);
        }
      })
      .filter((event: MouseEvent) => {
        const target = event.target as HTMLDivElement;
        const isDraggable =
          !event.button &&
          (!noDragClassName || !hasSelector(target, `.${noDragClassName}`, domNode)) &&
          (!handleSelector || hasSelector(target, handleSelector, domNode));

        return isDraggable;
      });

    d3Selection.call(d3DragInstance);
  }

  function destroy() {
    d3Selection.on('.drag', null);
  }

  return {
    update,
    destroy,
  };
}
