"use client";

import { Button } from "./ui/button";
import { ArrowLeft, MapPin, TrendingDown, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";

interface Location {
  id: string;
  name: string;
  district: string;
  score: number;
  commercialScore: number;
  realEstateScore: number;
  monthlyFootTraffic: string;
  avgRent: string;
  growthRate: number;
  matchRate: number;
  features: string[];
  savings: string;
  reason: string;
}

const alternativeLocations: Location[] = [
  {
    id: "alt1",
    name: "망원동",
    district: "서울 마포구",
    score: 88,
    commercialScore: 0.75,
    realEstateScore: 0.9,
    monthlyFootTraffic: "118만명",
    avgRent: "180만원",
    growthRate: 16.7,
    matchRate: 91,
    features: ["주거밀집", "로컬 감성", "안정적"],
    savings: "70만원/월",
    reason: "성수동과 유사한 트렌디함을 가지고 있지만 임대료가 28% 저렴합니다",
  },
  {
    id: "alt2",
    name: "을지로",
    district: "서울 중구",
    score: 85,
    commercialScore: 0.7,
    realEstateScore: 0.95,
    monthlyFootTraffic: "125만명",
    avgRent: "160만원",
    growthRate: 22.3,
    matchRate: 89,
    features: ["레트로", "급성장", "저렴"],
    savings: "90만원/월",
    reason: "최근 급성장 중인 힙한 지역으로 성수동보다 더 높은 성장률을 보입니다",
  },
  {
    id: "alt3",
    name: "문래동",
    district: "서울 영등포구",
    score: 82,
    commercialScore: 0.68,
    realEstateScore: 0.92,
    monthlyFootTraffic: "95만명",
    avgRent: "150만원",
    growthRate: 19.8,
    matchRate: 85,
    features: ["예술가", "독특한 분위기", "초저가"],
    savings: "100만원/월",
    reason: "아티스트와 젊은층이 모이는 새로운 핫플레이스로 부상 중",
  },
];

interface AlternativeLocationPageProps {
  currentLocation: any;
  onBack: () => void;
  onSelectLocation: (location: Location) => void;
}

export function AlternativeLocationPage({ currentLocation, onBack, onSelectLocation }: AlternativeLocationPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-6">
      <div className="max-w-[1400px] mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>AI 상담으로 돌아가기</span>
        </button>

        <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AI 추천 대안 지역</h1>
          </div>
          <p className="text-blue-100 text-lg mb-6">
            {currentLocation.name}과 비슷한 상권 특성을 가지고 있지만, 더 저렴한 부동산 가격의 지역을 찾았습니다
          </p>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-blue-200 text-sm mb-1">현재 선택지</div>
                <div className="text-2xl font-bold">{currentLocation.name}</div>
                <div className="text-blue-200 text-sm">임대료 {currentLocation.avgRent}</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-3xl">→</div>
              </div>
              <div>
                <div className="text-blue-200 text-sm mb-1">추천 대안</div>
                <div className="text-2xl font-bold">{alternativeLocations[0].name}</div>
                <div className="text-green-300 text-sm font-bold">
                  임대료 {alternativeLocations[0].avgRent} ({alternativeLocations[0].savings} 절감)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {alternativeLocations.map((location, idx) => (
            <div
              key={location.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-2 border-transparent hover:border-blue-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold">{location.name}</h3>
                      <Badge className="bg-green-600 text-white">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {location.savings} 절감
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{location.district}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-800">{location.score}</div>
                  <div className="text-xs text-gray-500">종합점수</div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-blue-800 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900 mb-1">AI 추천 이유</div>
                    <p className="text-sm text-gray-700">{location.reason}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">상권 점수</div>
                      <div className="text-2xl font-bold text-blue-800">{location.commercialScore}</div>
                      <div
                        className={`text-xs mt-1 ${
                          location.commercialScore >= currentLocation.commercialScore
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {location.commercialScore >= currentLocation.commercialScore ? "▲" : "▼"} {" "}
                        {Math.abs((location.commercialScore - currentLocation.commercialScore).toFixed(2))}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">부동산 점수</div>
                      <div className="text-2xl font-bold text-green-700">{location.realEstateScore}</div>
                      <div
                        className={`text-xs mt-1 ${
                          location.realEstateScore >= currentLocation.realEstateScore
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {location.realEstateScore >= currentLocation.realEstateScore ? "▲" : "▼"} {" "}
                        {Math.abs((location.realEstateScore - currentLocation.realEstateScore).toFixed(2))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">월 유동인구</span>
                      <span className="font-semibold">{location.monthlyFootTraffic}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">평균 임대료</span>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{location.avgRent}</div>
                        <div className="text-xs text-gray-500 line-through">{currentLocation.avgRent}</div>
                      </div>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">성장률</span>
                      <span className="font-semibold text-green-600">+{location.growthRate}%</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">업종 맞춤도</span>
                      <span className="font-semibold text-blue-800">{location.matchRate}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">주요 특징</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {location.features.map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <h4 className="font-bold mb-3">비용 절감 효과</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-700 mb-2">{location.savings}</div>
                    <div className="text-sm text-gray-700 mb-3">월 임대료 절감</div>
                    <div className="text-xs text-gray-600">
                      연간 약 {parseInt(location.savings) * 12}만원 절감 가능
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => onSelectLocation(location)} className="flex-1 bg-blue-950 hover:bg-slate-900">
                  이 지역 상세보기
                </Button>
                <Button variant="outline" className="px-6">
                  비교하기
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">아직도 고민이신가요?</h3>
            <p className="text-gray-600 mb-4">AI와 더 상담하고 싶으시다면 다시 돌아가세요</p>
            <Button onClick={onBack} variant="outline">
              AI 상담 계속하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
