import { useEffect, useRef, useCallback } from 'react';
import Konva from 'konva';
import { useWhiteboardLocalStore } from '@/store/useWhiteboardLocalStore';

interface UseSelectionBoxProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  enabled: boolean;
}

export function useSelectionBox({ stageRef, enabled }: UseSelectionBoxProps) {
  const isDrawingRef = useRef(false);

  const startSelectionBox = useWhiteboardLocalStore(
    (state) => state.startSelectionBox,
  );
  const updateSelectionBox = useWhiteboardLocalStore(
    (state) => state.updateSelectionBox,
  );
  const finishSelectionBox = useWhiteboardLocalStore(
    (state) => state.finishSelectionBox,
  );

  // 캔버스 좌표로 변환
  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return null;

      const container = stage.container();
      const rect = container.getBoundingClientRect();

      // 스크린 좌표 → Stage 좌표
      const stageX = clientX - rect.left;
      const stageY = clientY - rect.top;

      // Stage 좌표 → Canvas 좌표
      const transform = stage.getAbsoluteTransform().copy().invert();
      return transform.point({ x: stageX, y: stageY });
    },
    [stageRef],
  );

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;

      const point = getCanvasPoint(e.clientX, e.clientY);
      if (point) {
        updateSelectionBox(point.x, point.y);
      }
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;

      isDrawingRef.current = false;
      finishSelectionBox();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, updateSelectionBox, finishSelectionBox, getCanvasPoint]);

  // 선택 박스 시작
  const startSelection = useCallback(
    (point: { x: number; y: number }) => {
      isDrawingRef.current = true;
      startSelectionBox(point.x, point.y);
    },
    [startSelectionBox],
  );

  return {
    startSelection,
  };
}
