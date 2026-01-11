'use client';

const CAPITAL_OPTIONS = [
  { value: '10M', label: '1천만원 미만' },
  { value: '30M', label: '1천만원 ~ 3천만원' },
  { value: '50M', label: '3천만원 ~ 5천만원' },
  { value: '100M', label: '5천만원 ~ 1억원' },
  { value: '200M', label: '1억원 ~ 2억원' },
  { value: '200M+', label: '2억원 이상' },
] as const;

interface OnboardingStepCapitalProps {
  value: string;
  onChange: (value: string) => void;
}

export function OnboardingStepCapital({
  value,
  onChange,
}: OnboardingStepCapitalProps) {
  return (
    <div className="space-y-12">
      <h1 className="text-5xl font-semibold text-gray-900">
        준비된 창업 자본금을 알려주세요
      </h1>

      <div className="space-y-4">
        {CAPITAL_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-full p-8 border-2 rounded-2xl text-left transition-all hover:border-gray-900 hover:shadow-lg ${
              value === option.value
                ? 'border-gray-900 bg-gray-50 shadow-lg'
                : 'border-gray-300'
            }`}
          >
            <div className="text-2xl font-semibold text-gray-900">
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
