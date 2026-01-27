import type { ArrowItem, ShapeItem, WhiteboardItem } from '@/types/whiteboard';
import { getIntersectingPoint } from '@/utils/geom';

const ARROW_MARGIN = 10; // 화살표와 도형 사이의 간격

//도형  위치 변경시 연결된 화살표들의 바인딩 포인트를 업데이트
export function updateBoundArrows(
  shapeId: string,
  updatedShape: ShapeItem,
  items: WhiteboardItem[],
  updateItem: (id: string, attrs: Partial<WhiteboardItem>) => void,
) {
  // 해당 도형에 바인딩된 화살표 찾기
  const boundArrows = items.filter(
    (item) =>
      item.type === 'arrow' &&
      (item.startBinding?.elementId === shapeId ||
        item.endBinding?.elementId === shapeId),
  ) as ArrowItem[];

  const shapeCenterX = updatedShape.x + updatedShape.width / 2;
  const shapeCenterY = updatedShape.y + updatedShape.height / 2;

  boundArrows.forEach((arrow) => {
    const newPoints = [...arrow.points];
    let hasChange = false;

    // 시작점 업데이트
    if (arrow.startBinding?.elementId === shapeId) {
      const nextPoint = { x: newPoints[2], y: newPoints[3] };
      const result = updateBindingPoint(
        updatedShape,
        shapeCenterX,
        shapeCenterY,
        nextPoint,
      );

      newPoints[0] = result.x;
      newPoints[1] = result.y;
      arrow.startBinding.position = result.position;
      hasChange = true;
    }

    // 끝점 업데이트
    if (arrow.endBinding?.elementId === shapeId) {
      const prevPoint = {
        x: newPoints[newPoints.length - 4],
        y: newPoints[newPoints.length - 3],
      };
      const result = updateBindingPoint(
        updatedShape,
        shapeCenterX,
        shapeCenterY,
        prevPoint,
      );

      newPoints[newPoints.length - 2] = result.x;
      newPoints[newPoints.length - 1] = result.y;
      arrow.endBinding.position = result.position;
      hasChange = true;
    }

    // 화살표 업데이트
    if (hasChange) {
      updateItem(arrow.id, {
        points: newPoints,
        startBinding: arrow.startBinding,
        endBinding: arrow.endBinding,
      });
    }
  });
}

function updateBindingPoint(
  shape: ShapeItem,
  shapeCenterX: number,
  shapeCenterY: number,
  targetPoint: { x: number; y: number },
) {
  // 도형 경계와의 교차점 계산
  const intersect = getIntersectingPoint(
    {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    },
    targetPoint,
  );

  // 중심에서 바깥쪽으로 마진만큼 이동
  const angle = Math.atan2(
    intersect.y - shapeCenterY,
    intersect.x - shapeCenterX,
  );

  return {
    x: intersect.x + Math.cos(angle) * ARROW_MARGIN,
    y: intersect.y + Math.sin(angle) * ARROW_MARGIN,
    position: {
      x: (intersect.x - shape.x) / shape.width,
      y: (intersect.y - shape.y) / shape.height,
    },
  };
}
