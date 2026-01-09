"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface BreakevenPageProps {
  location: any;
  property: any;
  onBack: () => void;
  onComplete: () => void;
}

export function BreakevenPage({ location, property, onBack, onComplete }: BreakevenPageProps) {
  const [capital, setCapital] = useState("50000000");
  const [expectedRevenue, setExpectedRevenue] = useState("35000000");
  const [laborCost, setLaborCost] = useState("8000000");
  const [materialCost, setMaterialCost] = useState("10000000");
  const [loanAmount, setLoanAmount] = useState("0");
  const [interestRate, setInterestRate] = useState("4.5");

  const capitalNum = parseInt(capital) || 0;
  const revenueNum = parseInt(expectedRevenue) || 0;
  const laborNum = parseInt(laborCost) || 0;
  const materialNum = parseInt(materialCost) || 0;
  const rentNum = parseInt(property.monthlyRent.replace(/[^0-9]/g, "")) * 10000;
  const maintenanceNum = parseInt(property.maintenanceFee.replace(/[^0-9]/g, "")) * 10000;
  const loanNum = parseInt(loanAmount) || 0;
  const interestRateNum = parseFloat(interestRate) || 0;

  const depositNum = parseInt(property.deposit.replace(/[^0-9]/g, "")) * 10000;
  const monthlyInterest = (loanNum * (interestRateNum / 100)) / 12;
  const totalMonthlyCost = rentNum + maintenanceNum + laborNum + materialNum + monthlyInterest;
  const monthlyProfit = revenueNum - totalMonthlyCost;
  const initialInvestment = capitalNum + depositNum;
  const breakevenMonths = monthlyProfit > 0 ? Math.ceil(initialInvestment / monthlyProfit) : 0;
  const needsLoan = capitalNum < depositNum;
  const requiredLoan = needsLoan ? depositNum - capitalNum : 0;

  const chartData = Array.from({ length: 24 }, (_, i) => {
    const month = i + 1;
    const cumulativeProfit = monthlyProfit * month - initialInvestment;
    return {
      month: `${month}개월`,
      profit: cumulativeProfit / 10000,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-6">
      <div className="max-w-[1400px] mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>매물 목록으로 돌아가기</span>
        </button>

        <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-8 h-8" />
            <h1 className="text-3xl font-bold">손익분기점 계산</h1>
          </div>
          <p className="text-blue-100 text-lg">
            {location.name} • {property.address}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">창업 정보 입력</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">보유 자본금 (원)</label>
                  <Input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(e.target.value)}
                    placeholder="50000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">{(parseInt(capital) || 0).toLocaleString()}원</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">예상 월매출 (원)</label>
                  <Input
                    type="number"
                    value={expectedRevenue}
                    onChange={(e) => setExpectedRevenue(e.target.value)}
                    placeholder="35000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(parseInt(expectedRevenue) || 0).toLocaleString()}원
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">월 인건비 (원)</label>
                  <Input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    placeholder="8000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">{(parseInt(laborCost) || 0).toLocaleString()}원</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">월 재료비/원가 (원)</label>
                  <Input
                    type="number"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(e.target.value)}
                    placeholder="10000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(parseInt(materialCost) || 0).toLocaleString()}원
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">대출 정보 (선택)</h4>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">대출 금액 (원)</label>
                    <Input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="0"
                    />
                    {needsLoan && (
                      <p className="text-xs text-orange-600 mt-1">
                        최소 {requiredLoan.toLocaleString()}원 대출 필요
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">연 이자율 (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="4.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">매물 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">보증금</span>
                  <span className="font-medium">{property.deposit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">월세</span>
                  <span className="font-medium">{property.monthlyRent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">관리비</span>
                  <span className="font-medium">{property.maintenanceFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">면적</span>
                  <span className="font-medium">{property.size}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">손익분기점</div>
                <div className="text-3xl font-bold text-blue-800 mb-1">
                  {breakevenMonths > 0 ? `${breakevenMonths}개월` : "-"}
                </div>
                <div className="text-xs text-gray-500">
                  {breakevenMonths > 0 && `약 ${Math.ceil(breakevenMonths / 12)}년 ${breakevenMonths % 12}개월`}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">월 순이익</div>
                <div
                  className={`text-3xl font-bold mb-1 ${monthlyProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {monthlyProfit >= 0 ? "+" : ""}
                  {(monthlyProfit / 10000).toLocaleString()}만원
                </div>
                <div className="text-xs text-gray-500">
                  연 {((monthlyProfit * 12) / 10000).toLocaleString()}만원
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">초기 투자금</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {(initialInvestment / 10000).toLocaleString()}만원
                </div>
                <div className="text-xs text-gray-500">보증금 + 자본금</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">월별 수익/비용 분석</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700 font-medium">예상 월매출</span>
                  <span className="text-xl font-bold text-blue-800">
                    +{(revenueNum / 10000).toLocaleString()}만원
                  </span>
                </div>

                <div className="pl-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">월세</span>
                    <span className="text-red-600">-{(rentNum / 10000).toLocaleString()}만원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">관리비</span>
                    <span className="text-red-600">-{(maintenanceNum / 10000).toLocaleString()}만원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">인건비</span>
                    <span className="text-red-600">-{(laborNum / 10000).toLocaleString()}만원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">재료비/원가</span>
                    <span className="text-red-600">-{(materialNum / 10000).toLocaleString()}만원</span>
                  </div>
                  {loanNum > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">대출 이자</span>
                      <span className="text-red-600">-{(monthlyInterest / 10000).toLocaleString()}만원</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                  <span className="text-lg font-bold">월 순이익</span>
                  <span
                    className={`text-2xl font-bold ${monthlyProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {monthlyProfit >= 0 ? "+" : ""}
                    {(monthlyProfit / 10000).toLocaleString()}만원
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">누적 손익 추이 (24개월)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      fill="url(#profitGradient)"
                      name="누적 손익 (만원)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              {needsLoan && capitalNum < depositNum && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-orange-900 mb-1">대출이 필요합니다</h4>
                      <p className="text-sm text-gray-700">
                        보증금 {property.deposit}을 위해 최소 {requiredLoan.toLocaleString()}원의 대출이 필요합니다.
                        대출 정보를 입력하여 이자 비용을 포함한 정확한 계산을 확인하세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {monthlyProfit > 0 && breakevenMonths <= 12 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-green-900 mb-1">좋은 투자입니다!</h4>
                      <p className="text-sm text-gray-700">
                        손익분기점이 {breakevenMonths}개월로 비교적 짧습니다. 안정적인 수익을 기대할 수 있는 좋은 조건입니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {monthlyProfit < 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-900 mb-1">주의가 필요합니다</h4>
                      <p className="text-sm text-gray-700">
                        현재 설정으로는 월 순손실이 발생합니다. 매출을 높이거나 비용을 줄이는 방안을 고려해보세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">계산이 완료되었습니다!</h3>
                <p className="text-gray-600 mb-6">이 정보를 바탕으로 창업을 시작하시겠습니까?</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={onComplete} className="bg-blue-950 hover:bg-slate-900 px-8">
                    창업 준비 시작하기
                  </Button>
                  <Button onClick={onBack} variant="outline" className="px-8">
                    다른 매물 보기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
