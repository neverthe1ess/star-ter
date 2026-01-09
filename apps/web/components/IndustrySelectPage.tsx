'use client';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, ArrowRight, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './landing/header/Logo';

interface Industry {
  id: string;
  name: string;
  category: string;
  icon: string;
  avgRevenue: string;
  growthRate: number;
  difficulty: string;
  requiredCapital: string;
}

const industries: Industry[] = [
  {
    id: '1',
    name: '카페',
    category: '식음료',
    icon: '☕',
    avgRevenue: '3,500만원',
    growthRate: 12.5,
    difficulty: '중',
    requiredCapital: '5천만원',
  },
  {
    id: '2',
    name: '편의점',
    category: '소매',
    icon: '🏪',
    avgRevenue: '4,200만원',
    growthRate: 5.3,
    difficulty: '하',
    requiredCapital: '1억원',
  },
  {
    id: '3',
    name: '치킨집',
    category: '식음료',
    icon: '🍗',
    avgRevenue: '4,800만원',
    growthRate: 8.7,
    difficulty: '중',
    requiredCapital: '3천만원',
  },
];

interface IndustrySelectPageProps {
  onSelect: (industry: Industry) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

export function IndustrySelectPage({
  onSelect,
  onBack,
  onSkip,
}: IndustrySelectPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCategory = 'all';

  const filteredIndustries = industries.filter((industry) => {
    const matchesSearch = industry.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || industry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between border-b">
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

      <div className="flex-1 px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-semibold text-gray-900 mb-4">
                어떤 업종을 고려하고 계신가요?
              </h1>
              <p className="text-gray-600 text-xl">
                업종별 인사이트와 추천 지역을 확인해보세요
              </p>
            </div>
            {onSkip && (
              <Button
                onClick={onSkip}
                className="pl-64 pr-10 py-8 text-xl font-semibold bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 rounded-xl transition-all flex items-center gap-3 text-[20px]"
              >
                건너뛰기
                <ArrowRight className="w-6 h-6" />
              </Button>
            )}
          </div>

          <div className="mb-12">
            <div className="flex flex-col gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="업종 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-6 text-lg rounded-xl border-2 border-gray-300 focus:border-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIndustries.map((industry) => {
              const trendReasons: Record<string, string> = {
                '1': '디저트 오마카세와 로컬 블렌딩 커피에 대한 MZ세대의 수요가 급증하고 있습니다.',
                '2': '1인 가구 증가에 따른 프리미엄 간편식 및 고퀄리티 소규모 식당이 강세입니다.',
                '3': '단순 구매를 넘어선 체험형 팝업 스토어 및 큐레이션 샵이 상권의 핵심으로 부상 중입니다.',
                '4': '헬시 플레저(Healthy Pleasure) 열풍으로 개인 맞춤형 PT와 요가 스튜디오 수요가 꾸준합니다.',
                '5': '성인 자기계발 및 취미 클래스 시장이 오프라인 커뮤니티 중심으로 재편되고 있습니다.',
                '6': '반려동물 가구 1,500만 시대, 펫 프렌들리 상권 내 프리미엄 케어 서비스가 블루오션입니다.',
              };

              return (
                <div
                  key={industry.id}
                  className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full cursor-pointer overflow-hidden"
                  onClick={() => onSelect(industry)}
                >
                  <div className="relative z-20">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                        {industry.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {industry.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[12px] text-slate-400 mt-0.5">
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                          추천 업종
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100/50">
                      <p className="text-[13px] text-slate-600 leading-snug break-keep">
                        <span className="font-bold text-blue-900 mr-1.5">
                          TREND
                        </span>
                        {trendReasons[industry.id] ||
                          '데이터 분석 결과 해당 지역에서 높은 성장 잠재력을 보이고 있는 업종입니다.'}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-slate-400 group-hover:text-blue-900 transition-colors py-1">
                        상권분석 시작하기
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredIndustries.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
