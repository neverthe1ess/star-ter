'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TabOption<T extends string> {
  label: string;
  value: T;
}

interface TabChipsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: TabOption<T>[];
  variant?: 'primary' | 'secondary';
  showScrollButtons?: boolean;
}

export default function TabChips<T extends string>({
  value,
  onChange,
  options,
  variant = 'primary',
  showScrollButtons = false,
}: TabChipsProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [options]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  const baseStyle =
    'shrink-0 px-4 py-2 text-lg font-medium transition-all whitespace-nowrap';

  const styles = {
    primary: {
      active: 'text-gray-900 border-b-2 border-gray-900',
      inactive: 'text-gray-400 hover:text-gray-600',
    },
    secondary: {
      active: 'bg-gray-900 text-white rounded-full',
      inactive:
        'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full',
    },
  };

  return (
    <div className="relative flex items-center">
      {/* Left Arrow */}
      {showScrollButtons && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`flex gap-1 overflow-x-auto ${showScrollButtons ? 'mx-8' : ''}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`${baseStyle} ${
              value === opt.value
                ? styles[variant].active
                : styles[variant].inactive
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {showScrollButtons && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}
