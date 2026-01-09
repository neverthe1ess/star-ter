import type { Location } from "./types";

interface MatchingContentProps {
  location: Location;
}

export function MatchingContent({ location }: MatchingContentProps) {
  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900">
          업종 정밀 매칭 결과
        </h2>

        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative flex-shrink-0">
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
            <span className="text-3xl font-black text-blue-950">4,250만원</span>
          </div>
          <p className="text-green-600 text-sm font-bold flex items-center gap-1">
            <span>▲</span> 주변 평균 대비 15% 높음
          </p>
        </div>

        <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
          <p className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
            초기 예상 창업 비용
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-blue-950">
              1억 1,200만원
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            보증금, 권리금, 인테리어 일체 포함
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900">핵심 상권 지표</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "평균 유동인구", value: "15,840명", sub: "일평균" },
            {
              label: "경쟁 업체 수",
              value: "12개",
              sub: "적정 수준",
              color: "text-green-600",
            },
            { label: "평균 임대료", value: "280만원", sub: "월평균" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm"
            >
              <p className="text-xs font-bold text-slate-400 mb-2">
                {metric.label}
              </p>
              <p className="text-xl font-black text-slate-900">
                {metric.value}
              </p>
              <p
                className={`text-[11px] font-bold mt-1 ${metric.color || "text-slate-400"}`}
              >
                {metric.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">상권 성장 모멘텀</h3>
        <div className="h-48 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden p-8 flex items-end gap-3">
          {[40, 60, 45, 80, 70, 95, 85].map((val, i) => (
            <div
              key={i}
              className="flex-1 bg-blue-950/5 rounded-t-xl relative group h-full"
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-blue-950 rounded-t-xl transition-all duration-1000 group-hover:bg-blue-600"
                style={{ height: `${val}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
