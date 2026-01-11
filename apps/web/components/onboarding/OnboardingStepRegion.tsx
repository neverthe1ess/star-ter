'use client';

import {
  Building2,
  Home,
  ShoppingBag,
  GraduationCap,
  Train,
  Map,
} from 'lucide-react';

const REGION_OPTIONS = [
  { value: 'office', label: '오피스 밀집', Icon: Building2 },
  { value: 'residential', label: '주거 밀집', Icon: Home },
  { value: 'commercial', label: '상업 지역', Icon: ShoppingBag },
  { value: 'university', label: '대학가', Icon: GraduationCap },
  { value: 'station', label: '역세권', Icon: Train },
  { value: 'tourist', label: '관광지', Icon: Map },
] as const;

interface OnboardingStepRegionProps {
  value: string;
  onChange: (value: string) => void;
}

export function OnboardingStepRegion({
  value,
  onChange,
}: OnboardingStepRegionProps) {
  return (
    <div className="space-y-12">
      <h1 className="text-5xl font-semibold text-gray-900">
        선호하는 지역 특징을 선택하세요
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {REGION_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-12 border-2 rounded-2xl text-center transition-all hover:border-gray-900 hover:shadow-lg ${
              value === option.value
                ? 'border-gray-900 bg-gray-50 shadow-lg'
                : 'border-gray-300'
            }`}
          >
            <div className="flex justify-center mb-6">
              <option.Icon size={56} className="text-gray-900" />
            </div>
            <div className="text-xl font-semibold text-gray-900">
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
