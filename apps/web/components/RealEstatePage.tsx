"use client";

import { Button } from "./ui/button";
import { ArrowLeft, MapPin, Home, Calculator } from "lucide-react";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface RealEstateProperty {
  id: string;
  address: string;
  type: string;
  size: string;
  floor: string;
  deposit: string;
  monthlyRent: string;
  maintenanceFee: string;
  distance: string;
  condition: string;
  availableDate: string;
}

const properties: RealEstateProperty[] = [
  {
    id: "1",
    address: "성수동 1가 123-45",
    type: "상가",
    size: "45평 (148.5㎡)",
    floor: "1층",
    deposit: "5,000만원",
    monthlyRent: "250만원",
    maintenanceFee: "15만원",
    distance: "지하철역 200m",
    condition: "양호",
    availableDate: "즉시",
  },
  {
    id: "2",
    address: "성수동 2가 234-56",
    type: "상가",
    size: "38평 (125.4㎡)",
    floor: "1층",
    deposit: "3,000만원",
    monthlyRent: "220만원",
    maintenanceFee: "12만원",
    distance: "지하철역 350m",
    condition: "리모델링 필요",
    availableDate: "2026.02.01",
  },
  {
    id: "3",
    address: "성수동 1가 345-67",
    type: "상가",
    size: "52평 (171.6㎡)",
    floor: "1층",
    deposit: "7,000만원",
    monthlyRent: "280만원",
    maintenanceFee: "18만원",
    distance: "지하철역 150m",
    condition: "우수",
    availableDate: "즉시",
  },
];

interface RealEstatePageProps {
  location: any;
  onBack: () => void;
  onCalculateBreakeven: (property: RealEstateProperty) => void;
}

export function RealEstatePage({ location, onBack, onCalculateBreakeven }: RealEstatePageProps) {
  const [selectedProperty, setSelectedProperty] = useState<RealEstateProperty | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-6">
      <div className="max-w-[1400px] mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>뒤로 가기</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-8 h-8 text-blue-800" />
            <h1 className="text-3xl font-bold">{location.name} 부동산 매물</h1>
          </div>
          <p className="text-gray-600 text-lg">
            카페 창업에 적합한 매물을 찾았습니다. 임대 조건을 확인하고 손익분기점을 계산해보세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {properties.map((property) => (
            <div
              key={property.id}
              className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 cursor-pointer border-2 ${
                selectedProperty?.id === property.id ? "border-blue-800" : "border-transparent hover:border-blue-800"
              }`}
              onClick={() => setSelectedProperty(property)}
            >
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg h-40 mb-4 flex items-center justify-center">
                <Home className="w-12 h-12 text-gray-400" />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{property.type}</h3>
                    <Badge className="bg-blue-800">{property.floor}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{property.address}</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">면적</span>
                    <span className="font-medium">{property.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">보증금</span>
                    <span className="font-medium text-blue-800">{property.deposit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">월세</span>
                    <span className="font-medium text-blue-800">{property.monthlyRent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">관리비</span>
                    <span className="font-medium">{property.maintenanceFee}</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">역세권</span>
                    <span className="font-medium">{property.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">상태</span>
                    <span
                      className={`font-medium ${
                        property.condition === "우수"
                          ? "text-green-600"
                          : property.condition === "양호"
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    >
                      {property.condition}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">입주 가능</span>
                    <span className="font-medium">{property.availableDate}</span>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCalculateBreakeven(property);
                  }}
                  className="w-full bg-blue-950 hover:bg-slate-900"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  손익분기 계산하기
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">지도에서 보기</h3>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p>매물 위치 지도</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
