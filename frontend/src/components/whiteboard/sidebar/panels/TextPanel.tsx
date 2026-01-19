'use client';

import StrokeColorSection from '../sections/StrokeColorSection';

interface TextPanelProps {
  fill: string;
  onChangeFill: (color: string) => void;
}

export default function TextPanel({ fill, onChangeFill }: TextPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* 텍스트 색상 설정 */}
      <StrokeColorSection
        color={fill}
        onChange={onChangeFill}
        allowTransparent={false}
      />
    </div>
  );
}
