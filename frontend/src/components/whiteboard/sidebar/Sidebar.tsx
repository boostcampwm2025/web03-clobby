'use client';

import { useState } from 'react';

// 패널 컴포넌트들 임포트
import ShapePanel from '@/components/whiteboard/sidebar/panels/ShapePanel';

// TODO: 스토어 훅 임포트 필요 (추후 상태 관리 로직 교체)
// import { useWhiteboardStore } from '@/store/useWhiteboardStore';

// 사이드 바 선택된 요소 타입
type SelectionType = 'shape' | null;

export default function Sidebar() {
  // TODO : 상태 관리 로직 교체 필요
  // 현재 : useState로 로컬 상태 관리 -> 테스트용도
  const [selectionType, setSelectionType] = useState<SelectionType>('shape');

  // 추후 : Store에서 선택된 요소의 데이터 구독하는 방식으로 변경 예정
  // const selectedId = useWhiteboardStore((state) => state.selectedElementId);
  // const elements = useWhiteboardStore((state) => state.elements);
  // const updateElement = useWhiteboardStore((state) => state.updateElement);
  // const selectedElement = selectedId ? elements[selectedId] : null;
  // const selectionType = selectedElement ? selectedElement.type : 'none';

  // TODO : 데이터 매핑
  // const strokeColor = selectedElement?.strokeColor || '#000000';
  // const backgroundColor = selectedElement?.backgroundColor || 'transparent';
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('transparent');

  // 선택 타입에 따른 표시될 헤더 제목
  const getHeaderTitle = () => {
    switch (selectionType) {
      case 'shape':
        return 'Shape';
      default:
        return '';
    }
  };

  return (
    <aside className="absolute top-1/2 left-2 z-1 flex max-h-[calc(100vh-2rem)] w-56 -translate-y-1/2 flex-col overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 shadow-xl">
      {/* Sidebar Title */}
      <div className="mb-1">
        <h2 className="text-lg font-bold text-neutral-800">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* 패널 영역 */}
      <div className="flex-1">
        {/* shape */}
        {selectionType === 'shape' && (
          <ShapePanel
            strokeColor={strokeColor}
            backgroundColor={backgroundColor}
            // TODO: 업데이트 함수 교체
            // 변경된 값 스토어에 전달하는 방식 변경 필요
            // onChangeStrokeColor={(newColor) => updateElement(selectedId, { strokeColor: newColor })}
            onChangeStrokeColor={setStrokeColor}
            // onChangeBackgroundColor={(newColor) => updateElement(selectedId, { backgroundColor: newColor })}
            onChangeBackgroundColor={setBackgroundColor}
          />
        )}
      </div>
    </aside>
  );
}
