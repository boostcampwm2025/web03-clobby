'use client';

import { useEffect, useRef } from 'react';
import CursorIcon from '@/assets/icons/whiteboard/cursor/cursorIcon.svg';

interface RemoteCursorProps {
  x: number;
  y: number;
  color: string;
  name: string;
}

export default function RemoteCursor({ x, y, color, name }: RemoteCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, [x, y]);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none absolute left-0 top-0 transition-transform duration-100 ease-out"
      style={{ willChange: 'transform', color }}
    >
      {/* 커서 아이콘 */}
      <CursorIcon width={16} height={16} />
      
      {/* 사용자 이름 */}
      <div
        className="ml-5 mt-1 whitespace-nowrap rounded px-2 py-1 text-xs text-white shadow-md"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}
