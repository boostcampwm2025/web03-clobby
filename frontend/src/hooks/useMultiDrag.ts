import { useState, useCallback } from 'react';
import type { WhiteboardItem } from '@/types/whiteboard';
import { useItemActions } from '@/hooks/useItemActions';

interface UseMultiDragProps {
  selectedIds: string[];
  items: WhiteboardItem[];
}

export function useMultiDrag({ selectedIds, items }: UseMultiDragProps) {
  const { updateItem, performTransaction } = useItemActions();

  const [multiDragStartPos, setMultiDragStartPos] = useState<
    Map<string, { x: number; y: number }>
  >(new Map());
  const [multiDragDelta, setMultiDragDelta] = useState<{
    dx: number;
    dy: number;
  } | null>(null);

  // 드래그 시작 - 초기 위치 저장
  const startMultiDrag = useCallback(
    (draggedItemId: string) => {
      if (selectedIds.length <= 1 || !selectedIds.includes(draggedItemId)) {
        return;
      }

      const newStartPos = new Map<string, { x: number; y: number }>();
      selectedIds.forEach((id) => {
        const targetItem = items.find((it) => it.id === id);
        if (targetItem && 'x' in targetItem && 'y' in targetItem) {
          newStartPos.set(id, {
            x: targetItem.x,
            y: targetItem.y,
          });
        }
      });
      setMultiDragStartPos(newStartPos);
    },
    [selectedIds, items],
  );

  // 드래그 중 - delta 계산
  const updateMultiDrag = useCallback(
    (draggedItemId: string, x: number, y: number) => {
      if (selectedIds.length <= 1 || !selectedIds.includes(draggedItemId)) {
        return false;
      }

      const startPos = multiDragStartPos.get(draggedItemId);
      if (startPos) {
        const dx = x - startPos.x;
        const dy = y - startPos.y;
        setMultiDragDelta({ dx, dy });
        return true;
      }
      return false;
    },
    [selectedIds, multiDragStartPos],
  );

  // 드래그 종료 - 한번에 업데이트
  const finishMultiDrag = useCallback(() => {
    if (!multiDragDelta || selectedIds.length <= 1) {
      return;
    }

    const { dx, dy } = multiDragDelta;

    performTransaction(() => {
      selectedIds.forEach((itemId) => {
        const item = items.find((it) => it.id === itemId);
        if (!item) return;

        // Point 아이템 (arrow, line, drawing)
        if (
          item.type === 'arrow' ||
          item.type === 'line' ||
          item.type === 'drawing'
        ) {
          const newPoints = item.points.map((p, i) =>
            i % 2 === 0 ? p + dx : p + dy,
          );

          updateItem(itemId, { points: newPoints });
          return;
        }

        // 일반 아이템 (x, y 업데이트)
        if ('x' in item && 'y' in item) {
          updateItem(itemId, {
            x: item.x + dx,
            y: item.y + dy,
          });
        }
      });
    });

    setMultiDragStartPos(new Map());
    setMultiDragDelta(null);
  }, [multiDragDelta, selectedIds, items, updateItem, performTransaction]);

  // 멀티 드래그 중인지 확인
  const isMultiDragging = useCallback(
    (itemId: string) => {
      return (
        multiDragDelta !== null &&
        selectedIds.length > 1 &&
        selectedIds.includes(itemId)
      );
    },
    [multiDragDelta, selectedIds],
  );

  // 아이템의 드래그 중 위치 계산
  const getMultiDragPosition = useCallback(
    (itemId: string) => {
      if (!multiDragDelta || !selectedIds.includes(itemId)) {
        return null;
      }

      const startPos = multiDragStartPos.get(itemId);
      if (!startPos) return null;

      return {
        x: startPos.x + multiDragDelta.dx,
        y: startPos.y + multiDragDelta.dy,
      };
    },
    [multiDragDelta, selectedIds, multiDragStartPos],
  );

  return {
    multiDragDelta,
    startMultiDrag,
    updateMultiDrag,
    finishMultiDrag,
    isMultiDragging,
    getMultiDragPosition,
  };
}
