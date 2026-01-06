'use client';

interface ChipOption<T extends string> {
  label: string;
  value: T;
}

interface ChipSelectorProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ChipOption<T>[];
  className?: string;
}

export default function ChipSelector<T extends string>({
  value,
  onChange,
  options,
  className = '',
}: ChipSelectorProps<T>) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto scrollbar-hide ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            value === opt.value
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
