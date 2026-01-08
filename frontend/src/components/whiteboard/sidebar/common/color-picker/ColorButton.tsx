'use client';

interface ColorButtonProps {
  color: string;
  label?: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function ColorButton({
  color,
  label,
  isSelected,
  onClick,
}: ColorButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`h-6 w-6 rounded-md border border-neutral-200 transition-all focus:outline-none ${
        isSelected
          ? 'z-10 ring-2 ring-sky-300 ring-offset-1'
          : 'hover:scale-110'
      }`}
      style={{ backgroundColor: color === 'transparent' ? 'white' : color }}
      title={label || color}
    >
      {color === 'transparent' && (
        <div className="mx-auto h-full w-0.5 rotate-45 bg-red-500 opacity-30" />
      )}
    </button>
  );
}
