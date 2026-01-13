import type { ArrowItem } from '@/types/whiteboard';
import type {
  ArrowSize,
  ArrowStyle,
} from '@/components/whiteboard/sidebar/panels/arrowPresets';

// 현재 Arrow 사이즈 결정
export function getArrowSize(arrow: ArrowItem): ArrowSize {
  if (arrow.strokeWidth <= 2 && arrow.pointerLength <= 8) return 'S';
  if (arrow.strokeWidth <= 4 && arrow.pointerLength <= 14) return 'M';
  return 'L';
}

// 현재 Arrow 스타일 결정
export function getArrowStyle(arrow: ArrowItem): ArrowStyle {
  return arrow.tension === 0 ? 'straight' : 'curved';
}
