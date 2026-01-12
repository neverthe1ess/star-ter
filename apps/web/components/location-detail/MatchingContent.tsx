import { useEffect, useState } from 'react';

interface MatchingContentProps {
  locationName: string;
  trdarCd: string;
}

interface RevenueData {
  estimatedRevenue: number;
  startupCost: {
    total: number;
    deposit: number;
    premium: number;
    interior: number;
  };
  competitorCount: number;
  avgMonthlyRent: number;
  appliedIndustry: string;
  appliedIndustryName: string;
  matchingScore: number;
}

export function MatchingContent({
  locationName,
  trdarCd,
}: MatchingContentProps) {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

        const res = await fetch(
          `${API_URL}/analysis/revenue-cost?trdar_cd=${trdarCd}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          },
        );

        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch analysis data', error);
      } finally {
        setLoading(false);
      }
    }

    if (trdarCd) {
      fetchData();
    }
  }, [trdarCd]);

  // locationName을 사용하지 않아도 lint 경고 방지
  void locationName;

  const formatMoney = (amount: number) => {
    if (amount >= 100000000) {
      const uk = Math.floor(amount / 100000000);
      const man = Math.floor((amount % 100000000) / 10000);
      return `${uk}억 ${man > 0 ? man.toLocaleString() + '만' : ''}원`;
    }
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900">
          업종 정밀 매칭 결과
        </h2>

        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
          {data && data.matchingScore > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-10">
              {(() => {
                const getScoreContent = (score: number) => {
                  switch (true) {
                    case score >= 91:
                      return {
                        title: '"여기가 바로 명당입니다!"',
                        desc: '데이터가 증명하는 최적의 입지입니다. 사장님을 위해 준비된 기회를 놓치지 마세요.',
                        color: 'text-violet-600',
                      };
                    case score >= 80:
                      return {
                        title: '"성공 예감이 드는 곳입니다!"',
                        desc: '매우 훌륭한 매칭 점수입니다. 안정적인 수익 창출이 기대되는 매력적인 상권입니다.',
                        color: 'text-indigo-600',
                      };
                    case score >= 70:
                      return {
                        title: '"긍정적인 신호가 가득해요"',
                        desc: '상권 데이터가 사장님에게 호의적입니다. 좋은 기회가 될 수 있으니 적극적으로 검토해보세요.',
                        color: 'text-blue-600',
                      };
                    case score >= 51:
                      return {
                        title: '"안정적인 평균 수준입니다"',
                        desc: '무난한 선택지입니다. 차별화된 마케팅과 서비스로 승부한다면 충분히 좋은 성과를 낼 수 있습니다.',
                        color: 'text-emerald-600',
                      };
                    case score >= 31:
                      return {
                        title: '"가능성이 보이는 상권입니다"',
                        desc: '나쁘지 않은 조건이지만, 확실한 성공을 위해서는 이 상권만의 공략 포인트가 필요합니다.',
                        color: 'text-amber-500',
                      };
                    case score >= 21:
                      return {
                        title: '"신중한 재검토가 필요합니다"',
                        desc: '성공적인 창업을 위해서는 더 많은 준비가 필요해 보입니다. 리스크를 줄이기 위한 방안을 모색해보세요.',
                        color: 'text-orange-500',
                      };
                    default:
                      return {
                        title: '"새로운 전략이 필요해요"',
                        desc: '현재 데이터로는 높은 경쟁력을 기대하기 어렵습니다. 다른 지역이나 업종도 함께 고려해보시는 것을 추천합니다.',
                        color: 'text-rose-500',
                      };
                  }
                };

                const content = getScoreContent(data.matchingScore);

                return (
                  <>
                    <div className="relative shrink-0">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="transparent"
                          className="text-slate-200"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={364}
                          strokeDashoffset={
                            364 * (1 - data.matchingScore / 100)
                          }
                          className={content.color}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-3xl font-black ${content.color}`}
                        >
                          {data.matchingScore}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-center lg:text-left">
                      <h3
                        className={`text-2xl font-bold leading-tight ${content.color}`}
                      >
                        {content.title}
                      </h3>
                      <p className="text-slate-500 text-lg leading-relaxed break-keep">
                        {content.desc}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <p className="text-slate-400 font-bold">
                매칭 점수를 분석하고 있습니다...
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
          <p className="text-slate-400 text-md font-bold mb-3 uppercase tracking-wider">
            예상 월 매출액
          </p>
          <div className="flex items-baseline gap-2 my-4">
            {loading ? (
              <div className="h-9 w-32 bg-slate-200 animate-pulse rounded" />
            ) : (
              <span className="text-3xl font-black text-blue-950">
                {data
                  ? data.estimatedRevenue === 0
                    ? '점포 없음'
                    : `약 ${formatMoney(data.estimatedRevenue)}`
                  : '-'}
              </span>
            )}
          </div>
          <p className="text-slate-900 text-md font-bold flex items-center gap-1">
            <span>
              상권 내 {data?.appliedIndustryName || '전체 업종'} 매출 평균
            </span>
          </p>
        </div>

        <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
          <p className="text-slate-400 text-md font-bold my-4 uppercase tracking-wider">
            초기 예상 창업 비용
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            {loading ? (
              <div className="h-9 w-32 bg-slate-200 animate-pulse rounded" />
            ) : (
              <span className="text-3xl font-black text-blue-950">
                약 {data ? formatMoney(data.startupCost.total) : '-'}
              </span>
            )}
          </div>
          <p className="text-slate-900 text-md font-bold">
            보증금, 권리금, 인테리어 일체 포함
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">핵심 상권 지표</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: '경쟁 업체 수',
              value: data?.competitorCount
                ? `약 ${data.competitorCount}개`
                : '-',
              sub: '선호 업종 기준',
              color: 'text-rose-500',
            },
            {
              label: '평균 임대료',
              value: data?.avgMonthlyRent
                ? `약 ${formatMoney(data.avgMonthlyRent)}`
                : '-',
              sub: '상권 내 임대료 평균',
              color: 'text-blue-500',
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
            >
              <p className="text-md font-bold text-slate-400 uppercase tracking-wider">
                {metric.label}
              </p>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {metric.value}
              </p>
              <p
                className={`text-md font-bold mt-1 ${metric.color || 'text-slate-400'}`}
              >
                {metric.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
