'use client';

import { ChevronDown } from 'lucide-react';

interface FilterSelectOption<T extends string> {
  label: string;
  value: T;
}

interface FilterSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: FilterSelectOption<T>[];
  className?: string;
}

export default function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  className = '',
}: FilterSelectProps<T>) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-4 pr-10 text-xs font-bold text-gray-700 hover:border-blue-500 focus:border-blue-500 focus:outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
