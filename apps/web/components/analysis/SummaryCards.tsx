'use client';

import React from 'react';
import { Users, Clock, CreditCard, TrendingUp, BarChart3 } from 'lucide-react';
import { SummaryReportResponse } from '../../types/api-responses';

interface SummaryCardsProps {
  data: SummaryReportResponse;
  activeTab: string;
}

export default function SummaryCards({ data, activeTab }: SummaryCardsProps) {
  // 탭에 따라 다른 카드 세트 구성
  const cards = React.useMemo(() => {
    if (!data?.keyMetrics) return [];

    if (activeTab === 'location') {
      return [
        {
          id: 'area_type',
          label: '지역 유형',
          value: data.meta.region.includes('상권') ? '발달 상권' : '행정 구역',
          trend: 'stable',
          trendValue: '정보 제공',
          icon: <BarChart3 size={16} className="text-blue-600" />,
          bgColor: 'bg-blue-50',
        },
        {
          id: 'characteristics',
          label: '지역 특성',
          value: data.zoneOverview?.characteristics || '데이터 부족',
          trend: 'up',
          trendValue: '핵심 정보',
          icon: <Clock size={16} className="text-amber-600" />,
          bgColor: 'bg-amber-50',
        },
        {
          id: 'inflow',
          label: '주요 유입 경로',
          value: data.zoneOverview?.inflowPath || '데이터 부족',
          trend: 'stable',
          trendValue: '동선 분석',
          icon: <TrendingUp size={16} className="text-emerald-600" />,
          bgColor: 'bg-emerald-50',
        }
      ];
    }

    if (activeTab === 'population') {
      return [
        {
          id: 'floating',
          label: '일일 유동인구',
          value: `${(data.keyMetrics.floatingPopulation?.count || 0).toLocaleString()}명`,
          trend: 'stable',
          trendValue: '평균적',
          icon: <Users size={16} className="text-blue-600" />,
          bgColor: 'bg-blue-50',
        },
        {
          id: 'peak',
          label: '주요 방문 시간',
          value: data.keyMetrics.floatingPopulation?.mainTime || '데이터 부족',
          trend: 'up',
          trendValue: '피크타임',
          icon: <Clock size={16} className="text-amber-600" />,
          bgColor: 'bg-amber-50',
        },
        {
          id: 'days',
          label: '주요 방문 요일',
          value: data.keyMetrics.mainVisitDays?.days?.[0] ? `${data.keyMetrics.mainVisitDays.days[0]}요일` : '데이터 부족',
          trend: 'stable',
          trendValue: '안정적',
          icon: <TrendingUp size={16} className="text-emerald-600" />,
          bgColor: 'bg-emerald-50',
        }
      ];
    }

    if (activeTab === 'revenue') {
      return [
        {
          id: 'revenue',
          label: '월 평균 매출',
          value: `₩${((data.keyMetrics.estimatedMonthlySales?.max || 0) / 10000).toFixed(0)}만`,
          trend: 'up',
          trendValue: '주요 지표',
          icon: <TrendingUp size={16} className="text-emerald-600" />,
          bgColor: 'bg-emerald-50',
        },
        {
          id: 'well_doing',
          label: '우수 점포 매출',
          value: `₩${((data.keyMetrics.wellDoingMonthlySales?.max || 0) / 10000).toFixed(0)}만`,
          trend: 'up',
          trendValue: '상위 10%',
          icon: <TrendingUp size={16} className="text-blue-600" />,
          bgColor: 'bg-blue-50',
        },
        {
          id: 'payment',
          label: '결제 방식',
          value: '신용카드 위주',
          trend: 'stable',
          trendValue: '안정적 결제',
          icon: <CreditCard size={16} className="text-indigo-600" />,
          bgColor: 'bg-indigo-50',
        }
      ];
    }

    if (activeTab === 'industry') {
      return [
        {
          id: 'industry_type',
          label: '선택 업종',
          value: data.meta.category || '데이터 부족',
          trend: 'stable',
          trendValue: '분석 대상',
          icon: <BarChart3 size={16} className="text-blue-600" />,
          bgColor: 'bg-blue-50',
        },
        {
          id: 'competitor',
          label: '업종 내 포지션',
          value: '평균 수준',
          trend: 'stable',
          trendValue: '유지 중',
          icon: <TrendingUp size={16} className="text-emerald-600" />,
          bgColor: 'bg-emerald-50',
        },
        {
          id: 'growth',
          label: '업종 성장성',
          value: '성숙기',
          trend: 'stable',
          trendValue: '완만함',
          icon: <Clock size={16} className="text-amber-600" />,
          bgColor: 'bg-amber-50',
        }
      ];
    }

    if (activeTab === 'cost' || activeTab === 'risk') {
      return [
        {
          id: 'customer',
          label: '결제 고객층',
          value: data.keyMetrics.coreCustomer?.ageGroup || '데이터 부족',
          trend: 'up',
          trendValue: '구매력 높음',
          icon: <CreditCard size={16} className="text-indigo-600" />,
          bgColor: 'bg-indigo-50',
        },
        {
          id: 'competition',
          label: '경쟁 강도',
          value: data.keyMetrics.competitionIntensity?.level || '데이터 부족',
          trend: 'down',
          trendValue: '치열함',
          icon: <BarChart3 size={16} className="text-rose-600" />,
          bgColor: 'bg-rose-50',
        },
        {
          id: 'period',
          label: '분석 기간',
          value: data.meta.period || '데이터 부족',
          trend: 'stable',
          trendValue: '최신 정보',
          icon: <Clock size={16} className="text-gray-600" />,
          bgColor: 'bg-gray-100',
        },
      ];
    }

    return [];
  }, [data, activeTab]);

  return (
    <div className="grid grid-cols-3 gap-3 px-6 py-2">
      {cards.map((card) => (
        <div
          key={card.id}
          className="group p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:border-blue-100 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 ${card.bgColor} rounded-lg group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-tight">
              {card.label}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {card.value}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[11px] font-bold ${
                card.trend === 'up' ? 'text-emerald-600' : 
                card.trend === 'down' ? 'text-rose-600' : 'text-blue-600'
              }`}>
                {card.trend === 'up' ? '↑' : card.trend === 'down' ? '↓' : '•'} {card.trendValue}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
