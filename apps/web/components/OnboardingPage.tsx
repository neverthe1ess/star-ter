'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Logo } from './landing/header/Logo';
import {
  Building2,
  Home,
  ShoppingBag,
  GraduationCap,
  Train,
  Map,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export type OnboardingData = {
  age: string;
  region: string;
  operatingTime: string;
  capital: string;
};

const AGE_OPTIONS = [
  { value: '20s', label: '20대', desc: '젊은 층을 위한 트렌디한 업종' },
  { value: '30s', label: '30대', desc: '안정적인 수익 창출이 가능한 업종' },
  { value: '40s', label: '40대', desc: '경험을 활용할 수 있는 업종' },
  { value: '50s', label: '50대', desc: '노하우 기반의 전문 업종' },
  { value: '60s', label: '60대 이상', desc: '여유로운 운영이 가능한 업종' },
] as const;

const REGION_OPTIONS = [
  { value: 'office', label: '오피스 밀집', Icon: Building2 },
  { value: 'residential', label: '주거 밀집', Icon: Home },
  { value: 'commercial', label: '상업 지역', Icon: ShoppingBag },
  { value: 'university', label: '대학가', Icon: GraduationCap },
  { value: 'station', label: '역세권', Icon: Train },
  { value: 'tourist', label: '관광지', Icon: Map },
] as const;

const OPERATING_TIME_OPTIONS = [
  { value: 'morning', label: '오전', time: '06:00 - 12:00', Icon: Sunrise },
  { value: 'afternoon', label: '오후', time: '12:00 - 18:00', Icon: Sun },
  { value: 'evening', label: '저녁', time: '18:00 - 24:00', Icon: Sunset },
  { value: 'night', label: '야간', time: '24:00 - 06:00', Icon: Moon },
  { value: 'allday', label: '종일', time: '06:00 - 24:00', Icon: Clock },
] as const;

const CAPITAL_OPTIONS = [
  { value: '10M', label: '1천만원 미만' },
  { value: '30M', label: '1천만원 ~ 3천만원' },
  { value: '50M', label: '3천만원 ~ 5천만원' },
  { value: '100M', label: '5천만원 ~ 1억원' },
  { value: '200M', label: '1억원 ~ 2억원' },
  { value: '200M+', label: '2억원 이상' },
] as const;

interface OnboardingPageProps {
  onComplete: (data: OnboardingData) => Promise<void> | void;
  onBack?: () => void;
}

export function OnboardingPage({ onComplete, onBack }: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    age: '',
    region: '',
    operatingTime: '',
    capital: '',
  });

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      await onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else if (onBack) onBack();
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!data.age;
      case 2:
        return !!data.region;
      case 3:
        return !!data.operatingTime;
      case 4:
        return !!data.capital;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">뒤로</span>
        </button>
        <Logo className="h-8" />
        <div className="w-20"></div>
      </header>

      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-full bg-gray-900 transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 py-20">
        <div className="max-w-4xl w-full mx-auto">
          {step === 1 && (
            <div className="space-y-12">
              <h1 className="text-5xl font-semibold text-gray-900">
                타겟 연령층을 알려주세요.
              </h1>

              <div className="space-y-4">
                {AGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData({ ...data, age: option.value })}
                    className={`w-full p-8 border-2 rounded-2xl text-left transition-all hover:border-gray-900 hover:shadow-lg ${
                      data.age === option.value
                        ? 'border-gray-900 bg-gray-50 shadow-lg'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-semibold text-gray-900 mb-2">
                          {option.label}
                        </div>
                        <div className="text-lg text-gray-600">
                          {option.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12">
              <h1 className="text-5xl font-semibold text-gray-900">
                선호하는 지역 특징을 선택하세요
              </h1>

              <div className="grid grid-cols-3 gap-6">
                {REGION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData({ ...data, region: option.value })}
                    className={`p-12 border-2 rounded-2xl text-center transition-all hover:border-gray-900 hover:shadow-lg ${
                      data.region === option.value
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
          )}

          {step === 3 && (
            <div className="space-y-12">
              <h1 className="text-5xl font-semibold text-gray-900">
                희망 운영 시간대를 선택하세요
              </h1>

              <div className="space-y-4">
                {OPERATING_TIME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setData({ ...data, operatingTime: option.value })
                    }
                    className={`w-full p-8 border-2 rounded-2xl text-left transition-all hover:border-gray-900 hover:shadow-lg ${
                      data.operatingTime === option.value
                        ? 'border-gray-900 bg-gray-50 shadow-lg'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <option.Icon size={40} className="text-gray-900" />
                        <div>
                          <div className="text-2xl font-semibold text-gray-900 mb-2">
                            {option.label}
                          </div>
                          <div className="text-lg text-gray-600">
                            {option.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12">
              <h1 className="text-5xl font-semibold text-gray-900">
                준비된 창업 자본금을 알려주세요
              </h1>

              <div className="space-y-4">
                {CAPITAL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData({ ...data, capital: option.value })}
                    className={`w-full p-8 border-2 rounded-2xl text-left transition-all hover:border-gray-900 hover:shadow-lg ${
                      data.capital === option.value
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
          )}
        </div>
      </div>

      <div className="px-8 py-8 border-t">
        <div className="max-w-4xl mx-auto flex justify-end items-center">
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-7 rounded-lg text-lg font-medium disabled:bg-gray-300"
          >
            {step === 4 ? '완료' : '다음'}
          </Button>
        </div>
      </div>
    </div>
  );
}
