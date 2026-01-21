'use client';

import NavButton from '@/components/whiteboard/common/NavButton';
import { useWhiteboardHistory } from '@/hooks/useWhiteboardHistory';

import { UndoIcon, RedoIcon } from '@/assets/icons/whiteboard';

export default function HistoryControls() {
  const { undo, redo } = useWhiteboardHistory();

  return (
    <div className="absolute bottom-4 left-4 z-50 flex items-start">
      <div className="flex items-center gap-2 rounded bg-neutral-800 p-2">
        <NavButton icon={UndoIcon} label="실행 취소" onClick={undo} />
        <NavButton icon={RedoIcon} label="다시 실행" onClick={redo} />
      </div>
    </div>
  );
}
