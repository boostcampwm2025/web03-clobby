export * from '@/types/whiteboard/base';
export * from '@/types/whiteboard/items';

import {
  TextItem,
  ArrowItem,
  LineItem,
  DrawingItem,
  ShapeItem,
} from '@/types/whiteboard/items';

export type WhiteboardItem =
  | TextItem
  | ArrowItem
  | LineItem
  | DrawingItem
  | ShapeItem;
