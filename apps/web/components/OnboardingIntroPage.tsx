'use client';

import { Button } from './ui/button';
import { Logo } from './landing/header/Logo';
import { UserCircle, Store, BarChart3, ArrowLeft } from 'lucide-react';

interface OnboardingIntroPageProps {
  onStart: () => void;
  onBack?: () => void;
}

export function OnboardingIntroPage({
  onStart,
  onBack,
}: OnboardingIntroPageProps) {
  return (
    <div className="h-screen h-dvh bg-white flex flex-col overflow-hidden">
      <header className="px-4 py-6 flex items-center justify-between shrink-0">
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

      <div className="flex-1 flex flex-col justify-center px-[5%] py-[3vh] overflow-y-auto">
        <div className="max-w-[1200px] w-full mx-auto mb-[8vh] text-center">
          <h2 className="text-[clamp(2.5rem,6vw,4rem)] font-bold text-gray-900 mb-[2vh]">
            상권 분석을 쉽게 시작하세요
          </h2>
          <p className="text-[clamp(1.125rem,2.5vw,1.5rem)] text-gray-600">
            당신의 나이, 선호 지역, 운영 시간, 자본금을 기반으로 맞춤형 업종과
            최적의 창업 지역을 추천해드립니다.
          </p>
        </div>

        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4">
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-[clamp(320px,35vw,480px)] aspect-square shrink-0 rounded-2xl bg-white shadow-lg shadow-gray-200/80 border border-slate-200 p-[8%] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold text-white bg-blue-500">
                    추천
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    홍대입구역(홍대)
                  </h3>
                  <p className="text-sm font-semibold text-slate-400">서울</p>
                </div>
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 mb-2">
                      매칭 점수
                    </p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-blue-500">
                        81.2
                      </span>
                      <span className="text-sm font-bold text-blue-500">점</span>
                    </div>
                  </div>
                  <div className="relative right-6">
                    <div
                      className="relative"
                      style={{ width: '200px', height: '200px' }}
                    >
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        <polygon
                          points="100,30 166.57395614066075,78.36881039375368 141.14496766047313,156.63118960624632 58.855032339526886,156.63118960624632 33.426043859339245,78.36881039375369"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        ></polygon>
                        <polygon
                          points="100,65 133.28697807033038,89.18440519687684 120.57248383023656,128.31559480312316 79.42751616976344,128.31559480312316 66.71302192966962,89.18440519687684"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        ></polygon>
                        <line
                          x1="100"
                          y1="100"
                          x2="100"
                          y2="30"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        ></line>
                        <line
                          x1="100"
                          y1="100"
                          x2="166.57395614066075"
                          y2="78.36881039375368"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        ></line>
                        <line
                          x1="100"
                          y1="100"
                          x2="141.14496766047313"
                          y2="156.63118960624632"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        ></line>
                        <line
                          x1="100"
                          y1="100"
                          x2="58.855032339526886"
                          y2="156.63118960624632"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        ></line>
                        <line
                          x1="100"
                          y1="100"
                          x2="33.426043859339245"
                          y2="78.36881039375369"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        ></line>
                        <polygon
                          points="100,71.3 166.57395614066075,78.36881039375368 141.14496766047313,156.63118960624632 58.855032339526886,156.63118960624632 56.72692850857051,85.9397267559399"
                          fill="#3b82f6"
                          fillOpacity="0.25"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        ></polygon>
                        <circle cx="100" cy="71.3" r="3" fill="#3b82f6"></circle>
                        <circle
                          cx="166.57395614066075"
                          cy="78.36881039375368"
                          r="3"
                          fill="#3b82f6"
                        ></circle>
                        <circle
                          cx="141.14496766047313"
                          cy="156.63118960624632"
                          r="3"
                          fill="#3b82f6"
                        ></circle>
                        <circle
                          cx="58.855032339526886"
                          cy="156.63118960624632"
                          r="3"
                          fill="#3b82f6"
                        ></circle>
                        <circle
                          cx="56.72692850857051"
                          cy="85.9397267559399"
                          r="3"
                          fill="#3b82f6"
                        ></circle>
                      </svg>
                      <div
                        className="absolute text-[12px] font-semibold text-slate-500 whitespace-nowrap"
                        style={{
                          left: '100px',
                          top: '16px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        타깃 연령
                      </div>
                      <div
                        className="absolute text-[12px] font-semibold text-slate-500 whitespace-nowrap"
                        style={{
                          left: '181.889px',
                          top: '74.0426px',
                          transform: 'translate(0%, -50%)',
                        }}
                      >
                        창업 비용
                      </div>
                      <div
                        className="absolute text-[12px] font-semibold text-slate-500 whitespace-nowrap"
                        style={{
                          left: '151.374px',
                          top: '167.957px',
                          transform: 'translate(0%, -50%)',
                        }}
                      >
                        상권 테마
                      </div>
                      <div
                        className="absolute text-[12px] font-semibold text-slate-500 whitespace-nowrap"
                        style={{
                          left: '48.626px',
                          top: '167.957px',
                          transform: 'translate(-100%, -50%)',
                        }}
                      >
                        운영 시간
                      </div>
                      <div
                        className="absolute text-[12px] font-semibold text-slate-500 whitespace-nowrap"
                        style={{
                          left: '18.1113px',
                          top: '74.0426px',
                          transform: 'translate(-100%, -50%)',
                        }}
                      >
                        업종 적합
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="space-y-[5vh] max-w-lg mx-auto lg:mx-0">
              <div className="flex gap-[1.5vw]">
                <div className="shrink-0 bg-gray-50 p-[3%] rounded-2xl">
                  <UserCircle size={40} className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] text-gray-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold text-gray-900 mb-[1vh]">
                    기본 정보 입력
                  </h3>
                  <p className="text-gray-500 text-[clamp(0.875rem,1.8vw,1.125rem)] leading-relaxed">
                    나이, 선호 지역, 운영 시간 등 기본 정보를 알려주세요.
                  </p>
                </div>
              </div>

              <div className="flex gap-[1.5vw]">
                <div className="shrink-0 bg-gray-50 p-[3%] rounded-2xl">
                  <Store size={40} className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] text-gray-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold text-gray-900 mb-[1vh]">
                    업종 선택
                  </h3>
                  <p className="text-gray-500 text-[clamp(0.875rem,1.8vw,1.125rem)] leading-relaxed">
                    창업하고 싶은 업종을 선택하면 맞춤 분석을 제공합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-[1.5vw]">
                <div className="shrink-0 bg-gray-50 p-[3%] rounded-2xl">
                  <BarChart3 size={40} className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] text-gray-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold text-gray-900 mb-[1vh]">
                    상세 분석 확인
                  </h3>
                  <p className="text-gray-500 text-[clamp(0.875rem,1.8vw,1.125rem)] leading-relaxed">
                    AI 기반 상권 분석과 맞춤 지역 추천을 받아보세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-t">
        <div className="max-w-7xl mx-auto flex justify-end">
          <Button
            onClick={onStart}
            className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-7 rounded-lg text-lg font-medium cursor-pointer"
          >
            시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
