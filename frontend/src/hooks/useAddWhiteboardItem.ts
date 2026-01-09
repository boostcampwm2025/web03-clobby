import { useCanvasStore } from '@/store/useCanvasStore';
import { getCenterWorldPos } from '@/utils/coordinate';

export const useAddWhiteboardItem = () => {
  const addText = useCanvasStore((state) => state.addText);
  const addArrow = useCanvasStore((state) => state.addArrow);
  const selectItem = useCanvasStore((state) => state.selectItem);
  const stagePos = useCanvasStore((state) => state.stagePos);
  const stageScale = useCanvasStore((state) => state.stageScale);

  const handleAddText = () => {
    const worldPos = getCenterWorldPos(stagePos, stageScale);
    const textId = addText({ x: worldPos.x, y: worldPos.y });
    selectItem(textId);
  };

  const handleAddArrow = () => {
    const worldPos = getCenterWorldPos(stagePos, stageScale);
    addArrow({
      points: [worldPos.x - 100, worldPos.y, worldPos.x + 100, worldPos.y],
    });
  };

  return {
    handleAddText,
    handleAddArrow,
  };
};
