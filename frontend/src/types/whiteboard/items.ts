import { BaseItem, TextAlignment, TextWrap } from '@/types/whiteboard/base';

export interface TextItem extends BaseItem {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: TextAlignment;
  wrap: TextWrap;
  rotation: number;
  width: number;
  parentPolygonId?: string;
}

export interface ArrowItem extends BaseItem {
  type: 'arrow';
  points: number[];
  stroke: string;
  strokeWidth: number;
  pointerLength: number;
  pointerWidth: number;
  tension: number;
}
