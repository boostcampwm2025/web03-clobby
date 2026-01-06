'use client';

import TextPropertyBar from './properties/TextPropertyBar';

export default function ToolbarContainer() {
  return (
    <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2">
      <TextPropertyBar />
    </div>
  );
}
