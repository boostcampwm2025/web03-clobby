'use client';

import Section from '@/components/whiteboard/sidebar/ui/Section';
import ColorPicker from '@/components/whiteboard/sidebar/ui/ColorPicker';

// 테두리 색상 설정 섹션
interface StrokeColorSectionProps {
  color: string;
  onChange: (color: string) => void;
}

export default function StrokeColorSection({
  color,
  onChange,
}: StrokeColorSectionProps) {
  return (
    <Section title="Stroke">
      <ColorPicker color={color} onChange={onChange} allowTransparent={false} />
    </Section>
  );
}
