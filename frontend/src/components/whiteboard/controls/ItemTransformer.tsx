'use client';

import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { Transformer } from 'react-konva';
import type { WhiteboardItem } from '@/types/whiteboard';

interface ItemTransformerProps {
  selectedId: string | null;
  items: WhiteboardItem[];
  stageRef: React.RefObject<Konva.Stage | null>;
}

export default function ItemTransformer({
  selectedId,
  items,
  stageRef,
}: ItemTransformerProps) {
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const selectedItem = items.find((item) => item.id === selectedId);
  const isTextSelected = selectedItem?.type === 'text';
  const isArrowSelected = selectedItem?.type === 'arrow';
  const isDrawingSelected = selectedItem?.type === 'drawing';

  // Transformer 연결 (화살표는 제외)
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const stage = stageRef.current;

      if (selectedId && !isArrowSelected) {
        const selectedNode = stage.findOne('#' + selectedId);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        } else {
          transformerRef.current.nodes([]);
        }
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedId, items, stageRef, isArrowSelected]);

  return (
    <Transformer
      ref={transformerRef}
      enabledAnchors={
        isTextSelected
          ? ['middle-left', 'middle-right']
          : [
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'top-center',
              'bottom-center',
              'middle-left',
              'middle-right',
            ]
      }
      rotateEnabled={!isDrawingSelected}
      anchorSize={10}
      anchorCornerRadius={5}
      anchorStrokeWidth={1.5}
      anchorStroke="#0369A1"
      borderStroke="#0369A1"
      borderStrokeWidth={1.5}
      rotationSnaps={[0, 90, 180, 270]}
      rotationSnapTolerance={10}
      keepRatio={false}
      boundBoxFunc={(_oldBox, newBox) => {
        // 최소 크기 제한
        const minWidth = 30;
        const minHeight = 30;

        newBox.width = Math.max(minWidth, Math.abs(newBox.width));
        newBox.height = Math.max(minHeight, Math.abs(newBox.height));

        return newBox;
      }}
    />
  );
}
