'use client';

import StrokeColorSection from '@/components/whiteboard/sidebar/sections/StrokeColorSection';
import BackgroundColorSection from '@/components/whiteboard/sidebar/sections/BackgroundColorSection';

// ShapePanel 컴포넌트
interface ShapePanelProps {
  strokeColor: string;
  backgroundColor: string;
  onChangeStrokeColor: (color: string) => void;
  onChangeBackgroundColor: (color: string) => void;
}

export default function ShapePanel({
  strokeColor,
  backgroundColor,
  onChangeStrokeColor,
  onChangeBackgroundColor,
}: ShapePanelProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* 도형 테두리 색상 설정 섹션 */}
      <StrokeColorSection color={strokeColor} onChange={onChangeStrokeColor} />

      {/* 도형 배경 색상 설정 섹션 */}
      <BackgroundColorSection
        color={backgroundColor}
        onChange={onChangeBackgroundColor}
      />

      {/* 도형 관련 설정 추가 */}
    </div>
  );
}
