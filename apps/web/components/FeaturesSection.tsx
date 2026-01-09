import { Button } from "./ui/button";

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-sm px-3 py-1 bg-white border border-gray-300 rounded-full">
                  빅데이터 상권
                </div>
                <div className="text-sm px-3 py-1 bg-gray-200 text-gray-600 rounded-full">
                  AI 수익 예측
                </div>
                <div className="text-sm px-3 py-1 bg-gray-200 text-gray-600 rounded-full">
                  업종 추천
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-6">정교한 상권 데이터 분석</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                안정적인 수익을 위해 Starter는 공공데이터와 카드사 매출 데이터를 분석합니다.<br />
                단순한 정보 제공을 넘어, AI가 당신의 성공 가능성을 수치로 증명합니다.
              </p>
              <Button className="bg-blue-950 hover:bg-slate-900 text-white px-8 py-6 rounded-xl">
                상세 분석 서비스 보기
              </Button>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl flex items-center justify-center text-white text-xl">
                    📊
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">예상 월평균 매출액</div>
                    <div className="text-2xl font-bold text-gray-900">3,450만 원</div>
                  </div>
                </div>
                <button className="text-sm text-blue-600 font-semibold hover:underline">
                  리포트 다운로드
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">상권 종합 점수</div>
                  <div className="text-sm font-bold">87/100</div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-900 h-full w-[87%] rounded-full"></div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-bold">상위 4.2% 상권</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">성수동 카페거리</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="text-sm font-bold text-gray-900 mb-4">주요 유동인구 지표</div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "주말 비율", value: "42.5%", trend: "+2.1%", color: "text-blue-600" },
                    { label: "2030 비율", value: "68.2%", trend: "+5.4%", color: "text-red-600" },
                    { label: "남성 비율", value: "45.8%", trend: "-0.8%", color: "text-gray-500" },
                    { label: "여성 비율", value: "54.2%", trend: "+0.8%", color: "text-red-600" },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{item.value}</span>
                        <span className={`text-[10px] ${item.color}`}>{item.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            데이터로 증명하는 3단계 신뢰 시스템
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
            Starter는 가장 객관적인 데이터를 수집하고 가공하여 창업자에게 전달합니다.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📡</span>
              </div>
              <h3 className="text-xl font-bold mb-3">공공데이터 연동</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                정부 및 지자체에서 제공하는<br />
                검증된 상권 데이터를<br />
                실시간으로 수집합니다.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-xl font-bold mb-3">카드 매출 분석</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                카드사 익명 결제 데이터를 기반으로<br />
                실제 업종별 매출 규모와<br />
                소비 성향을 정밀 분석합니다.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-3">AI 예측 모델</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                자체 개발한 AI 알고리즘이<br />
                향후 1년간의 매출 추이와<br />
                폐업 위험도를 예측합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
