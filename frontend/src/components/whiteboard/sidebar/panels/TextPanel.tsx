'use client';

import StrokeColorSection from '@/components/whiteboard/sidebar/sections/StrokeColorSection';
import TextSizeSection from '@/components/whiteboard/sidebar/sections/TextSizeSection';
import type { TextSize } from './textPresets';

// TextPanel 컴포넌트
interface TextPanelProps {
  fill: string;
  size: TextSize;
  onChangeFill: (color: string) => void;
  onChangeSize: (size: TextSize) => void;
}

export default function TextPanel({
  fill,
  size,
  onChangeFill,
  onChangeSize,
}: TextPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* 텍스트 색상 설정 섹션 */}
      <StrokeColorSection
        color={fill}
        onChange={onChangeFill}
        allowTransparent={false}
      />

      {/* 텍스트 크기 설정 섹션 */}
      <TextSizeSection size={size} onChangeSize={onChangeSize} />
    </div>
  );
}
