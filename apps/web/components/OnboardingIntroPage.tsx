'use client';

import { Button } from './ui/button';
import { Logo } from './landing/header/Logo';
import { UserCircle, Store, BarChart3, ArrowLeft } from 'lucide-react';

const previewImage = '/landing/6e80870c2bfb5a9be684e9f5690556264086efa0.png';

interface OnboardingIntroPageProps {
  onStart: () => void;
  onBack?: () => void;
}

export function OnboardingIntroPage({
  onStart,
  onBack,
}: OnboardingIntroPageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">뒤로</span>
          </button>
        )}
        <Logo className="h-8" />
        <div className="w-20"></div>
      </header>

      <div className="flex-1 flex flex-col justify-center px-8 pb-32">
        <div className="max-w-7xl w-full mx-auto mb-20">
          <h1 className="text-6xl font-semibold text-gray-900 mb-4">
            상권 분석을 쉽게 시작하세요
          </h1>
          <p className="text-xl text-gray-600">
            당신의 나이, 선호 지역, 운영 시간, 자본금을 기반으로 맞춤형 업종과
            최적의 창업 지역을 추천해드립니다.
          </p>
        </div>

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="relative max-w-lg">
              <div className="absolute -top-4 -left-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium">
                Show preview
              </div>
              <img
                src={previewImage}
                alt="상권 분석 미리보기"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">
                다음 단계는?
              </h2>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <UserCircle className="w-14 h-14 text-gray-900" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-semibold text-gray-900 mb-3">
                  기본 정보 입력
                </h3>
                <p className="text-gray-600 text-xl">
                  나이, 선호 지역, 운영 시간 등 기본 정보를 알려주세요.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Store className="w-14 h-14 text-gray-900" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-semibold text-gray-900 mb-3">
                  업종 선택
                </h3>
                <p className="text-gray-600 text-xl">
                  창업하고 싶은 업종을 선택하면 맞춤 분석을 제공합니다.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <BarChart3 className="w-14 h-14 text-gray-900" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-semibold text-gray-900 mb-3">
                  상세 분석 확인
                </h3>
                <p className="text-gray-600 text-xl">
                  AI 기반 상권 분석과 맞춤 지역 추천을 받아보세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 border-t">
        <div className="max-w-7xl mx-auto flex justify-end">
          <Button
            onClick={onStart}
            className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-7 rounded-lg text-lg font-medium"
          >
            시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
