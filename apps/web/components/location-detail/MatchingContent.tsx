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
  appliedIndustry: string;
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

        const token = localStorage.getItem('accessToken');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(
          `${API_URL}/analysis/revenue-cost?trdar_cd=${trdarCd}`,
          { headers },
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
          <div className="flex flex-col lg:flex-row items-center gap-10">
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
                  strokeDashoffset={364 * (1 - 0.98)}
                  className="text-blue-950"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-blue-950">98%</span>
              </div>
            </div>

            <div className="space-y-3 text-center lg:text-left">
              <h3 className="text-xl font-bold text-blue-950 leading-tight">
                &quot;이곳은 사장님에게 최고의 선택지입니다&quot;
              </h3>
              <p className="text-slate-500 text-base leading-relaxed break-keep">
                자본금 7천만원 규모와 MZ세대 타겟팅을 고려했을 때, 인근 경쟁
                업종 대비 희소성이 높고 주중/주말 유동인구 밸런스가 매우
                뛰어납니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
          <p className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
            예상 월 매출액
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            {loading ? (
              <div className="h-9 w-32 bg-slate-200 animate-pulse rounded" />
            ) : (
              <span className="text-3xl font-black text-blue-950">
                {data ? formatMoney(data.estimatedRevenue) : '-'}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm font-bold flex items-center gap-1">
            <span>주변 매장들의 매출액의 평균치</span>
          </p>
        </div>

        <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
          <p className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
            초기 예상 창업 비용
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            {loading ? (
              <div className="h-9 w-32 bg-slate-200 animate-pulse rounded" />
            ) : (
              <span className="text-3xl font-black text-blue-950">
                {data ? formatMoney(data.startupCost.total) : '-'}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm font-medium">
            보증금, 권리금, 인테리어 일체 포함
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">핵심 상권 지표</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: '평균 유동인구', value: '15,840명', sub: '일평균' },
            {
              label: '경쟁 업체 수',
              value: '12개',
              sub: '적정 수준',
              color: 'text-green-600',
            },
            { label: '평균 임대료', value: '280만원', sub: '월평균' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {metric.label}
              </p>
              <p className="text-lg font-black text-slate-900 mt-2">
                {metric.value}
              </p>
              <p
                className={`text-[11px] font-bold mt-1 ${metric.color || 'text-slate-400'}`}
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
