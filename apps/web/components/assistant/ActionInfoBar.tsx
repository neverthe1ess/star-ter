'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  Scale, 
  Calculator, 
  FileText,
  MapPin,
  Building,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useRevenueRanking, RankItem } from '@/hooks/useRevenueRanking';
import { useRealEstateBookmark } from '@/hooks/useRealEstateBookmark';
import type { AssistantAction, FrontendActionType } from '@/types/assistant-types';
import type { RealEstateItem } from '@/types/map-store-types';

// -----------------------------------------
// ActionInfoBar Props
// -----------------------------------------
interface ActionInfoBarProps {
  action: AssistantAction | null;
  isLoading?: boolean;
  selectedRealEstateItem?: RealEstateItem | null;
}

// -----------------------------------------
// 액션별 아이콘 매핑
// -----------------------------------------
const ACTION_ICONS: Record<FrontendActionType, React.ReactNode> = {
  showMarker: <MapPin className="w-4 h-4" />,
  highlightPolygon: <MapPin className="w-4 h-4" />,
  compare: <Scale className="w-4 h-4" />,
  showRanking: <TrendingUp className="w-4 h-4" />,
  filterPopulation: <Users className="w-4 h-4" />,
  openAnalysisPanel: <BarChart3 className="w-4 h-4" />,
  calculateRent: <Calculator className="w-4 h-4" />,
  generateReport: <FileText className="w-4 h-4" />,
  recommendRealEstate: <Building className="w-4 h-4" />,
};

// -----------------------------------------
// 액션별 제목
// -----------------------------------------
const ACTION_TITLES: Record<FrontendActionType, string> = {
  showMarker: '위치 정보',
  highlightPolygon: '상권 영역',
  compare: '상권 비교',
  showRanking: '매출 랭킹',
  filterPopulation: '유동인구',
  openAnalysisPanel: '상권 분석',
  calculateRent: '임대료 분석',
  generateReport: '리포트 생성',
  recommendRealEstate: '추천 매물',
};

// -----------------------------------------
// 미니 바 차트 (랭킹용)
// -----------------------------------------
function MiniBarChart({ values, maxValue }: { values: number[]; maxValue: number }) {
  return (
    <div className="flex items-end gap-1 h-8">
      {values.slice(0, 5).map((value, i) => (
        <div
          key={i}
          className="w-3 bg-blue-400 rounded-t transition-all duration-300"
          style={{ height: `${Math.max(10, (value / maxValue) * 100)}%` }}
        />
      ))}
    </div>
  );
}

// -----------------------------------------
// 미니 라인 차트 (인구용)
// -----------------------------------------
function MiniLineChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-20 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// -----------------------------------------
// 프로그레스 바
// -----------------------------------------
function ProgressBar({ value, max, color = 'blue' }: { value: number; max: number; color?: string }) {
  const percent = Math.min(100, (value / max) * 100);
  const colorClass = color === 'blue' ? 'bg-blue-400' : color === 'green' ? 'bg-green-400' : 'bg-purple-400';
  
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

// -----------------------------------------
// 듀얼 비교 바
// -----------------------------------------
function DualCompareBar({ valueA, valueB, labelA, labelB }: { 
  valueA: number; 
  valueB: number; 
  labelA: string; 
  labelB: string;
}) {
  const total = valueA + valueB || 1;
  const percentA = (valueA / total) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{labelA}</span>
        <span>{labelB}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
        <div 
          className="h-full bg-blue-400 transition-all duration-500"
          style={{ width: `${percentA}%` }}
        />
        <div 
          className="h-full bg-purple-400 transition-all duration-500"
          style={{ width: `${100 - percentA}%` }}
        />
      </div>
    </div>
  );
}

// -----------------------------------------
// 랭킹 뷰 (useRevenueRanking 훅 사용) - 세로 레이아웃
// -----------------------------------------
function RankingView({ level, industryCode }: { level: 'gu' | 'dong' | 'commercial'; industryCode?: string }) {
  const { items, isLoading, formatAmount, handleSelect } = useRevenueRanking({ level, industryCode });
  
  // TOP 5 데이터
  const top5 = items.slice(0, 5);
  const maxAmount = top5.length > 0 ? Math.max(...top5.map(i => i.amount)) : 1;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-4">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>랭킹 로딩 중...</span>
      </div>
    );
  }
  
  if (top5.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">랭킹 데이터 없음</p>;
  }
  
  return (
    <div className="space-y-4">
      {/* 바 차트 - 가로로 크게 */}
      <div className="flex items-end justify-between gap-2 h-20 px-2">
        {top5.map((item: RankItem, i: number) => (
          <button
            key={item.code}
            onClick={() => handleSelect(item.name, item.code, level)}
            className="group flex-1 flex flex-col items-center"
          >
            <div
              className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer ${
                i === 0 ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-gradient-to-t from-gray-300 to-gray-200 hover:from-blue-400 hover:to-blue-300'
              }`}
              style={{ height: `${Math.max(20, (item.amount / maxAmount) * 80)}px` }}
            />
          </button>
        ))}
      </div>
      
      {/* 순위 라벨 */}
      <div className="flex justify-between px-2 text-xs">
        {top5.map((item: RankItem, i: number) => (
          <button
            key={item.code}
            onClick={() => handleSelect(item.name, item.code, level)}
            className="flex-1 text-center group"
          >
            <span className={`font-bold ${i === 0 ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'}`}>
              {i + 1}위
            </span>
            <p className="text-gray-600 truncate text-[11px] mt-0.5 group-hover:text-blue-600">
              {item.name.length > 6 ? item.name.slice(0, 6) + '..' : item.name}
            </p>
          </button>
        ))}
      </div>
      
      {/* 1위 상세 정보 */}
      <div className="bg-blue-50 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-blue-500 font-medium">🏆 1위</span>
          <p className="font-bold text-gray-800">{top5[0]?.name}</p>
        </div>
        <span className="text-lg font-bold text-blue-600">{formatAmount(top5[0]?.amount || 0)}</span>
      </div>
    </div>
  );
}

// -----------------------------------------
// 유동인구 뷰 (시간대별 미니 라인 차트)
// -----------------------------------------
function PopulationView({ genderFilter, ageFilter, timeFilter }: { 
  genderFilter?: string; 
  ageFilter?: string;
  timeFilter?: string;
}) {
  // 시간대별 샘플 데이터 (실제로는 usePopulationLayer 훅 데이터 사용)
  const timeLabels = ['오전', '낮', '저녁', '밤'];
  const values = [35, 85, 95, 60]; // 샘플 데이터
  
  return (
    <div className="flex items-center gap-4 flex-1">
      {/* 미니 라인 차트 */}
      <MiniLineChart values={values} />
      
      {/* 필터 정보 */}
      <div className="text-sm flex-1">
        <p className="font-medium text-gray-800">시간대별 유동인구</p>
        <div className="flex gap-2 text-xs text-gray-500">
          <span className="px-1.5 py-0.5 bg-blue-50 rounded">{genderFilter || '전체'}</span>
          <span className="px-1.5 py-0.5 bg-purple-50 rounded">{ageFilter || '전 연령'}</span>
        </div>
      </div>
      
      {/* 피크 시간 */}
      <div className="text-right">
        <p className="text-xs text-gray-500">피크 시간</p>
        <p className="text-sm font-bold text-blue-600">저녁</p>
      </div>
    </div>
  );
}

// -----------------------------------------
// 분석 뷰 (업종별 상세 정보 + 창업 인사이트) - API 연결
// -----------------------------------------
function AnalysisView({ areaName, lat, lng, level, industryCode }: { 
  areaName?: string; 
  lat?: number; 
  lng?: number;
  level?: string;
  industryCode?: string;
}) {
  const [data, setData] = React.useState<{
    openingRate: number;
    closureRate: number;
    storeCount: number;
    franchiseCount: number;
    quarterlyRevenue: number;
    similarStoreCount: number;
  }>({
    openingRate: 0,
    closureRate: 0,
    storeCount: 0,
    franchiseCount: 0,
    quarterlyRevenue: 0,
    similarStoreCount: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (!lat || !lng) {
      setIsLoading(false);
      return;
    }
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
    });
    if (level) params.set('level', level);
    if (industryCode) params.set('industryCode', industryCode);
    
    fetch(`${API_BASE_URL}/market/analytics?${params.toString()}`)
      .then(res => res.json())
      .then(response => {
        setData({
          openingRate: response.vitality?.openingRate || 0,
          closureRate: response.vitality?.closureRate || 0,
          storeCount: response.storeCount || 0,
          franchiseCount: response.franchiseCount || 0,
          quarterlyRevenue: response.revenue?.quarterly || 0,
          similarStoreCount: response.similarStoreCount || 0,
        });
      })
      .catch(err => console.error('Analytics fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [lat, lng, level, industryCode]);
  
  // 창업 추천 점수 계산 (0-100)
  const startupScore = React.useMemo(() => {
    const survivalRate = 100 - data.closureRate;
    const growthRate = data.openingRate;
    const competitionPenalty = Math.min(data.storeCount * 2, 30); // 경쟁이 많으면 감점
    const score = Math.max(0, Math.min(100, survivalRate * 0.5 + growthRate * 0.3 + (30 - competitionPenalty)));
    return Math.round(score);
  }, [data]);
  
  const scoreLabel = startupScore >= 70 ? '추천' : startupScore >= 40 ? '보통' : '주의';
  const scoreColor = startupScore >= 70 ? 'text-green-600' : startupScore >= 40 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = startupScore >= 70 ? 'bg-green-50' : startupScore >= 40 ? 'bg-yellow-50' : 'bg-red-50';
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span>분석 중...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* 상단: 창업 추천 점수 */}
      <div className={`${scoreBg} rounded-xl p-3 flex items-center justify-between`}>
        <div>
          <p className="text-xs text-gray-500 font-medium">
            {industryCode ? '🍗 업종별 창업 추천' : '📊 전체 업종 평균'}
          </p>
          <p className="font-bold text-gray-800">{areaName || '상권 분석'}</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${scoreColor}`}>{startupScore}</p>
          <p className={`text-xs font-medium ${scoreColor}`}>{scoreLabel}</p>
        </div>
      </div>
      
      {/* 중단: 핵심 지표 4개 */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
          <p className="text-lg font-bold text-gray-800">{data.storeCount}</p>
          <p className="text-[10px] text-gray-500">점포수</p>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
          <p className="text-lg font-bold text-blue-600">{data.franchiseCount}</p>
          <p className="text-[10px] text-gray-500">프랜차이즈</p>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
          <p className="text-lg font-bold text-green-600">{data.openingRate.toFixed(1)}%</p>
          <p className="text-[10px] text-gray-500">개업률</p>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
          <p className="text-lg font-bold text-red-500">{data.closureRate.toFixed(1)}%</p>
          <p className="text-[10px] text-gray-500">폐업률</p>
        </div>
      </div>
      
      {/* 하단: 분기 매출 + 인사이트 */}
      {data.quarterlyRevenue > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">분기 매출 추정</p>
            <p className="text-lg font-bold text-gray-800">
              {(data.quarterlyRevenue / 100000000).toFixed(1)}억원
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">경쟁 강도</p>
            <p className={`text-sm font-bold ${data.storeCount > 15 ? 'text-red-500' : data.storeCount > 8 ? 'text-yellow-500' : 'text-green-500'}`}>
              {data.storeCount > 15 ? '치열 🔥' : data.storeCount > 8 ? '보통 ⚡' : '낮음 ✅'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------
// 비교 뷰 (듀얼 프로그레스) - API 연결
// -----------------------------------------
function CompareView({ nameA, nameB, codeA, codeB }: { 
  nameA?: string; 
  nameB?: string;
  codeA?: string;
  codeB?: string;
}) {
  const [revenueA, setRevenueA] = React.useState<number>(0);
  const [revenueB, setRevenueB] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (!codeA || !codeB) {
      setIsLoading(false);
      return;
    }
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    
    // 두 상권의 매출 데이터 병렬 조회
    Promise.all([
      fetch(`${API_BASE_URL}/revenue/ranking?level=commercial&limit=1000`).then(r => r.json()),
    ])
      .then(([rankingData]) => {
        // 랭킹에서 해당 코드 찾기
        const itemA = rankingData.items?.find((i: { code: string }) => i.code === codeA);
        const itemB = rankingData.items?.find((i: { code: string }) => i.code === codeB);
        setRevenueA(itemA?.amount ? Math.round(itemA.amount / 100000000) : 50);
        setRevenueB(itemB?.amount ? Math.round(itemB.amount / 100000000) : 40);
      })
      .catch(err => console.error('Compare fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [codeA, codeB]);
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span>비교 중...</span>
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-2">
      <DualCompareBar 
        valueA={revenueA} 
        valueB={revenueB} 
        labelA={nameA || '상권 A'} 
        labelB={nameB || '상권 B'} 
      />
      <div className="flex justify-between text-xs">
        <span className="text-blue-600 font-medium">{revenueA}억</span>
        <span className="text-purple-600 font-medium">{revenueB}억</span>
      </div>
    </div>
  );
}

// -----------------------------------------
// 임대료 뷰 (수익성 게이지) - 실제 계산 로직
// -----------------------------------------
function RentView({ areaSize, monthlyRent, deposit }: { 
  areaSize?: number; 
  monthlyRent?: number; 
  deposit?: number;
}) {
  // 수익성 점수 계산 (간단한 공식)
  // 월 매출 대비 임대료 비율로 점수 산정 (예: 임대료가 매출의 10% 이하면 100점)
  const estimatedMonthlyRevenue = 5000; // 예상 월 매출 (만원) - 실제로는 API에서 조회
  const rentRatio = monthlyRent ? (monthlyRent / estimatedMonthlyRevenue) * 100 : 10;
  const profitScore = Math.max(0, Math.min(100, 100 - rentRatio));
  const estimatedProfit = Math.round(estimatedMonthlyRevenue - (monthlyRent || 0));
  
  return (
    <div className="flex items-center gap-4 flex-1">
      {/* 게이지 */}
      <div className="flex-1">
        <ProgressBar value={profitScore} max={100} color="green" />
        <p className="text-xs text-gray-500 mt-1">수익성 점수: {profitScore.toFixed(0)}/100</p>
      </div>
      
      {/* 예상 수익 */}
      <div className="text-right">
        <p className="text-lg font-bold text-green-600">월 {estimatedProfit}만</p>
        <p className="text-xs text-gray-500">예상 순수익</p>
      </div>
    </div>
  );
}

// -----------------------------------------
// 리포트 뷰 (진행률 + 다운로드)
// -----------------------------------------
function ReportView({ areaName }: { areaName?: string }) {
  const [progress, setProgress] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  
  React.useEffect(() => {
    // 프로그레스 애니메이션
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="flex-1">
        <ProgressBar value={progress} max={100} color="purple" />
        <p className="text-xs text-gray-500 mt-1">
          {isComplete ? '리포트 생성 완료!' : `${areaName || '상권'} 리포트 생성 중...`}
        </p>
      </div>
      {isComplete && (
        <button className="px-4 py-2 bg-purple-500 text-white text-xs font-medium rounded-xl hover:bg-purple-600 transition shadow-sm">
          다운로드
        </button>
      )}
    </div>
  );
}

// -----------------------------------------
// 부동산 매물 상세 뷰
// -----------------------------------------
function RealEstateView({ item }: { item?: RealEstateItem | null }) {
  // 즐겨찾기 훅 사용
  const { toggleBookmark, isBookmarked, loading } = useRealEstateBookmark();

  // DB는 천원(1000원) 단위로 저장
  // 천원 → 만원: / 10
  // 1억원 = 100,000,000원 = 100,000 (천원 단위)
  function formatMoney(value: number | null): string {
    if (!value) return '0';
    
    // 먼저 만원 단위로 변환 (천원 → 만원: / 10)
    const manWon = value / 10;
    
    // 1억 이상 (10000만원 이상)
    if (manWon >= 10000) {
      const eok = Math.floor(manWon / 10000);
      const man = Math.floor(manWon % 10000);
      return `${eok}억${man > 0 ? ` ${man.toLocaleString()}만` : ''}`;
    }
    
    // 만원 단위로 표시
    return `${Math.floor(manWon).toLocaleString()}만`;
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full py-2">
        <p className="text-sm text-gray-500 text-center animate-pulse">
          지도에서 마커를 클릭하여 <br/> 상세 정보를 확인하세요
        </p>
      </div>
    );
  }

  const bookmarked = isBookmarked(item.id);

  return (
    <div className="space-y-3">
      {/* 가격 정보 + 즐겨찾기 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
            {item.floor}층
          </span>
          <h3 className="text-lg font-bold text-gray-900">
             보증금 {formatMoney(item.deposit)} / 월 {formatMoney(item.monthlyrent)}
          </h3>
        </div>
        {/* 즐겨찾기 버튼 */}
        <button
          onClick={() => toggleBookmark(item.id)}
          disabled={loading}
          className={`p-2 rounded-full transition-all duration-200 ${
            bookmarked 
              ? 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-yellow-500'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={bookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <Star 
            className={`w-5 h-5 transition-transform ${loading ? 'animate-pulse' : ''}`} 
            fill={bookmarked ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* 상세 스펙 */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
          <span className="text-gray-500">전용면적</span>
          <span className="font-bold text-gray-800">{item.size}평</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
          <span className="text-gray-500">권리금</span>
          <span className="font-bold text-gray-800">
            {item.premium ? `${formatMoney(item.premium)}` : '없음'}
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
          <span className="text-gray-500">관리비</span>
          <span className="font-bold text-gray-800">
             {item.maintenancefee ? `${formatMoney(item.maintenancefee)}원` : '-'}
          </span>
        </div>
         <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
          <span className="text-gray-500">입주가능일</span>
          <span className="font-bold text-gray-800">
             {item.ismoveindate ? item.moveindate : '즉시 가능'}
          </span>
        </div>
      </div>

      {/* 매물 이름/설명 */}
      {item.title && (
        <p className="text-xs text-gray-500 line-clamp-1 border-t border-gray-100 pt-2 mt-1">
          {item.title}
        </p>
      )}
    </div>
  );
}


// -----------------------------------------
// 액션별 컨텐츠 렌더링
// -----------------------------------------
function ActionContent({ action, selectedRealEstateItem }: { action: AssistantAction; selectedRealEstateItem?: RealEstateItem | null }) {
  const { type, payload } = action;

  switch (type) {
    case 'showMarker':
    case 'highlightPolygon':
      return (
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="font-medium text-gray-800">{payload.name || payload.areaName || '선택된 위치'}</p>
            <p className="text-xs text-gray-500">{payload.level === 'commercial' ? '상권' : payload.level === 'dong' ? '동' : '구'}</p>
          </div>
        </div>
      );

    case 'showRanking':
      return <RankingView level={payload.level || 'commercial'} industryCode={payload.industryCode} />;

    case 'filterPopulation':
      return <PopulationView genderFilter={payload.genderFilter} ageFilter={payload.ageFilter} timeFilter={payload.timeFilter} />;

    case 'openAnalysisPanel':
      return <AnalysisView areaName={payload.areaName} lat={payload.coordinates?.[0]} lng={payload.coordinates?.[1]} level={payload.level} industryCode={payload.industryCode} />;

    case 'compare':
      return (
        <CompareView 
          nameA={payload.compareTargets?.nameA} 
          nameB={payload.compareTargets?.nameB}
          codeA={payload.compareTargets?.codeA}
          codeB={payload.compareTargets?.codeB}
        />
      );

    case 'calculateRent':
      return <RentView areaSize={payload.rentParams?.area} monthlyRent={payload.rentParams?.rent} deposit={payload.rentParams?.deposit} />;

    case 'generateReport':
      return <ReportView areaName={payload.areaName} />;

    case 'recommendRealEstate':
      return <RealEstateView item={selectedRealEstateItem} />;

    default:
      return <p className="text-sm text-gray-500">정보 없음</p>;
  }
}

// -----------------------------------------
// 메인 ActionInfoBar 컴포넌트
// -----------------------------------------
export default function ActionInfoBar({ action, isLoading, selectedRealEstateItem }: ActionInfoBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (!action) return null;

  const icon = ACTION_ICONS[action.type];
  const title = ACTION_TITLES[action.type];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-lg">
      <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 px-6 transition-all duration-300 ${isCollapsed ? 'py-3' : 'py-5'}`}>
        {/* 헤더 */}
        <div className={`flex items-center gap-3 ${isCollapsed ? '' : 'mb-4 pb-3 border-b border-gray-100'}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
            {icon}
          </div>
          <span className="text-base font-bold text-gray-800">{title}</span>
          
          {/* 로딩 인디케이터 */}
          {isLoading && !isCollapsed && (
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          
          {/* 접기/펼치기 버튼 */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? '펼치기' : '접기'}
          >
            {isCollapsed ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* 컨텐츠 - 접힌 상태가 아닐 때만 표시 */}
        {!isCollapsed && (
          <div className="min-h-[80px]">
            <ActionContent action={action} selectedRealEstateItem={selectedRealEstateItem} />
          </div>
        )}
      </div>
    </div>
  );
}


