"use client";

import React from "react";
import { MapPin, Building2, Home } from "lucide-react";

/**
 * ListingsCard - 매물 리스트 카드 컴포넌트
 *
 * list.listings 액션 타입에 대응
 * recommend_real_estate 도구 결과를 시각화
 */

// 개별 매물 데이터 타입
interface ListingItem {
  id: string;
  title: string;
  address: string;
  deposit: number; // 보증금 (원)
  monthlyRent: number; // 월세 (원)
  size?: number; // 면적 (평)
  floor?: string; // 층수
  distance?: number; // 거리 (m)
}

interface ListingsData {
  listings: ListingItem[];
  totalCount: number;
  areaName?: string;
}

interface ListingsCardProps {
  data: ListingsData | null;
  isLoading?: boolean;
  areaName?: string;
}

// 화폐 포맷팅 함수 (만원 단위)
const formatCurrency = (amount: number): string => {
  if (amount >= 100000000) {
    const uk = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    return man > 0 ? `${uk}억 ${man.toLocaleString()}만` : `${uk}억`;
  }
  return `${Math.floor(amount / 10000).toLocaleString()}만`;
};

export function ListingsCard({ data, isLoading, areaName }: ListingsCardProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!data || !data.listings || data.listings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-slate-500">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          <span>조건에 맞는 매물을 찾을 수 없습니다.</span>
        </div>
      </div>
    );
  }

  const { listings, totalCount } = data;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 my-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-800">
            추천 매물 {areaName && <span className="text-slate-500">- {areaName}</span>}
          </h3>
        </div>
        <span className="text-base text-slate-500">총 {totalCount}건</span>
      </div>

      {/* 매물 리스트 */}
      <div className="space-y-3">
        {listings.map((listing, index) => (
          <div
            key={listing.id || index}
            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start">
              {/* 왼쪽: 제목, 주소 */}
              <div className="flex-1">
                <div className="text-xl font-semibold text-slate-800 mb-1">
                  {listing.title || `매물 ${index + 1}`}
                </div>
                <div className="text-lg text-slate-500 mb-1">
                  {listing.address}
                </div>
                {listing.distance && (
                  <div className="flex items-center gap-1 text-md text-blue-600">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.distance}m</span>
                  </div>
                )}
              </div>

              {/* 오른쪽: 가격 정보 */}
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(listing.deposit)} /{" "}
                  {formatCurrency(listing.monthlyRent)}
                </div>
                <div className="text-sm text-slate-400">보증금 / 월세</div>
                {listing.size && (
                  <div className="text-base text-slate-600 mt-1">
                    {listing.size}평 {listing.floor && `· ${listing.floor}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 더보기 안내 */}
      {totalCount > listings.length && (
        <div className="mt-4 text-center text-base text-slate-500">
          외 {totalCount - listings.length}건의 매물이 더 있습니다.
        </div>
      )}
    </div>
  );
}
