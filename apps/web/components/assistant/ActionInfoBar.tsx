'use client';

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  Scale, 
  Calculator, 
  FileText,
  MapPin
} from 'lucide-react';
import { useRevenueRanking, RankItem } from '@/hooks/useRevenueRanking';
import type { AssistantAction, FrontendActionType } from '@/types/assistant-types';

// -----------------------------------------
// ActionInfoBar Props
// -----------------------------------------
interface ActionInfoBarProps {
  action: AssistantAction | null;
  isLoading?: boolean;
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
// 랭킹 뷰 (useRevenueRanking 훅 사용)
// -----------------------------------------
function RankingView({ level, industryCode }: { level: 'gu' | 'dong' | 'commercial'; industryCode?: string }) {
  const { items, isLoading, formatAmount, handleSelect } = useRevenueRanking({ level, industryCode });
  
  // TOP 5 데이터
  const top5 = items.slice(0, 5);
  const maxAmount = top5.length > 0 ? Math.max(...top5.map(i => i.amount)) : 1;
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span>랭킹 로딩 중...</span>
      </div>
    );
  }
  
  if (top5.length === 0) {
    return <p className="text-sm text-gray-500">랭킹 데이터 없음</p>;
  }
  
  return (
    <div className="flex items-center gap-4 flex-1">
      {/* 미니 바 차트 */}
      <div className="flex items-end gap-1 h-10">
        {top5.map((item: RankItem, i: number) => (
          <button
            key={item.code}
            onClick={() => handleSelect(item.name, item.code, level)}
            className="group relative"
          >
            <div
              className="w-4 bg-blue-400 hover:bg-blue-500 rounded-t transition-all duration-300 cursor-pointer"
              style={{ height: `${Math.max(16, (item.amount / maxAmount) * 40)}px` }}
            />
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
              {i + 1}
            </span>
          </button>
        ))}
      </div>
      
      {/* 1위 정보 */}
      <div className="text-sm flex-1">
        <p className="font-medium text-gray-800 truncate">{top5[0]?.name}</p>
        <p className="text-xs text-gray-500">{formatAmount(top5[0]?.amount || 0)}</p>
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
// 분석 뷰 (개업률/폐업률 카드)
// -----------------------------------------
function AnalysisView({ areaName }: { areaName?: string }) {
  // 샘플 데이터 (실제로는 useMarketAnalysis 훅 데이터 사용)
  const openingRate = 12;
  const closureRate = 8;
  const isHealthy = openingRate > closureRate;
  
  return (
    <div className="flex items-center gap-4 flex-1">
      {/* 개업/폐업 카드 */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="px-3 py-1.5 bg-green-50 rounded-lg">
          <p className="text-[10px] text-green-600 font-medium">개업률</p>
          <p className="text-lg font-bold text-green-700">{openingRate}%</p>
        </div>
        <div className="px-3 py-1.5 bg-red-50 rounded-lg">
          <p className="text-[10px] text-red-600 font-medium">폐업률</p>
          <p className="text-lg font-bold text-red-700">{closureRate}%</p>
        </div>
      </div>
      
      {/* 상권 정보 */}
      <div className="text-sm flex-1">
        <p className="font-medium text-gray-800">{areaName || '상권 분석'}</p>
        <p className={`text-xs ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
          {isHealthy ? '✓ 건강한 상권' : '⚠ 주의 필요'}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------
// 비교 뷰 (듀얼 프로그레스)
// -----------------------------------------
function CompareView({ nameA, nameB, codeA, codeB }: { 
  nameA?: string; 
  nameB?: string;
  codeA?: string;
  codeB?: string;
}) {
  // 샘플 데이터 (실제로는 comparison API 호출)
  const revenueA = 65;
  const revenueB = 45;
  
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
// 임대료 뷰 (수익성 게이지)
// -----------------------------------------
function RentView({ area, deposit, rent }: { area?: number; deposit?: number; rent?: number }) {
  // 샘플 수익성 점수 계산
  const profitScore = 72;
  const estimatedProfit = 320;
  
  return (
    <div className="flex items-center gap-4 flex-1">
      {/* 게이지 */}
      <div className="flex-1">
        <ProgressBar value={profitScore} max={100} color="green" />
        <p className="text-xs text-gray-500 mt-1">수익성 점수: {profitScore}/100</p>
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
// 액션별 컨텐츠 렌더링
// -----------------------------------------
function ActionContent({ action }: { action: AssistantAction }) {
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
      return <AnalysisView areaName={payload.areaName} />;

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
      return <RentView area={payload.rentParams?.area} deposit={payload.rentParams?.deposit} rent={payload.rentParams?.rent} />;

    case 'generateReport':
      return <ReportView areaName={payload.areaName} />;

    default:
      return <p className="text-sm text-gray-500">정보 없음</p>;
  }
}

// -----------------------------------------
// 메인 ActionInfoBar 컴포넌트
// -----------------------------------------
export default function ActionInfoBar({ action, isLoading }: ActionInfoBarProps) {
  if (!action) return null;

  const icon = ACTION_ICONS[action.type];
  const title = ACTION_TITLES[action.type];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 px-5 py-4 transition-all duration-300">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {icon}
          </div>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {isLoading && (
            <div className="ml-auto flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* 컨텐츠 */}
        <div className="flex items-center">
          <ActionContent action={action} />
        </div>
      </div>
    </div>
  );
}
