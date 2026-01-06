'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';

interface SlideOption<T extends string> {
  label: string;
  value: T;
}

interface SlideSelectorProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SlideOption<T>[];
  label?: string;
}

export default function SlideSelector<T extends string>({
  value,
  onChange,
  options,
  label = '선택',
}: SlideSelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || label;

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:border-blue-500 transition-all"
      >
        <span>{selectedLabel}</span>
        <ChevronRight
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Slide Panel */}
      <div
        className={`absolute top-0 left-full ml-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 transition-all duration-200 ${
          isOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-500">업종 선택</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        </div>
        <div className="p-2 max-h-[300px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all whitespace-nowrap ${
                  value === opt.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
