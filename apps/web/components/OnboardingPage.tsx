'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import {
  AGE_OPTIONS,
  REGION_OPTIONS,
  OPERATING_TIME_OPTIONS,
  CAPITAL_OPTIONS,
  type OnboardingData,
} from "./onboarding/onboarding-options";

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
