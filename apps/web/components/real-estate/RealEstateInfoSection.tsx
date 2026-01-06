'use client';

import React from 'react';
import {
  Building2,
  MapPin,
  X,
  Home,
  Ruler,
  FileText,
  ChevronLeft,
} from 'lucide-react';
import { useMapStore } from '../../stores/useMapStore';
import { RealEstateItem } from '../../types/map-store-types';

export default function RealEstateInfoSection() {
  const { selectedRealEstateItem, setSelectedRealEstateItem, realEstateList } =
    useMapStore();

  const handleBack = () => {
    setSelectedRealEstateItem(null);
  };

  // 상세 뷰 (Overlay)
  if (selectedRealEstateItem) {
    return (
      <div className="relative h-full flex flex-col p-6 bg-white">
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex flex-col bg-white">
          {/* 상세 헤더 */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="ml-1 font-medium">목록으로</span>
            </button>
            <button
              onClick={() => setSelectedRealEstateItem(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <DetailView item={selectedRealEstateItem} />
          </div>
        </div>
      </div>
    );
  }

  // 리스트 뷰
  return (
    <div className="relative h-full flex flex-col p-6 bg-white">
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex flex-col bg-white">
        {/* 리스트 헤더 */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 flex items-end gap-2">
            <span>부동산 매물</span>
            <span className="text-lg text-gray-500 font-normal">
              {realEstateList.length}
            </span>
          </h1>
          {/* 필터 더미 (나중에 구현) */}
          <div className="flex gap-2">
            <span className="text-xs text-gray-400">최신순</span>
          </div>
        </div>

        {/* 리스트 목록 */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-4">
          {realEstateList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Building2 size={48} className="opacity-20 mb-4" />
              <p>지도 영역 내 매물이 없습니다.</p>
              <p className="text-sm mt-1">지도를 이동해보세요.</p>
            </div>
          ) : (
            realEstateList.map((item) => (
              <RealEstateCard
                key={item.id}
                item={item}
                onClick={() => setSelectedRealEstateItem(item)}
                onHover={(isHovering) =>
                  useMapStore
                    .getState()
                    .setHoveredRealEstateItemId(isHovering ? item.id : null)
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 리스트 아이템 컴포넌트
function RealEstateCard({
  item,
  onClick,
  onHover,
}: {
  item: RealEstateItem;
  onClick: () => void;
  onHover: (state: boolean) => void;
}) {
  const { deposit, monthlyrent, size, title, previewphotourl, roadaddress } =
    item;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row h-auto sm:h-32"
    >
      {/* 이미지 썸네일 */}
      <div className="w-full sm:w-32 h-32 bg-gray-200 shrink-0 relative">
        {previewphotourl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewphotourl}
            alt={title || '매물'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
            <Building2 size={24} />
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <div className="text-lg font-bold text-gray-900 leading-tight">
            월세 {formatMoney(deposit)} / {formatMoney(monthlyrent)}
          </div>

          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <span>{formatArea(size)}</span>
            <span className="w-px h-2 bg-gray-300 mx-1"></span>
            <span>
              {roadaddress?.split(' ').slice(0, 2).join(' ') || '주소미상'}
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-600 truncate mt-2">
          {title || '상세 설명 없음'}
        </div>
      </div>
    </div>
  );
}

// 상세 뷰 컴포넌트 (이전 구현 재사용)
function DetailView({ item }: { item: RealEstateItem }) {
  const {
    name,
    address,
    roadaddress,
    deposit,
    monthlyrent,
    size,
    previewphotourl,
    title,
  } = item;

  return (
    <div>
      {previewphotourl && (
        <div className="w-full h-64 bg-gray-200 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewphotourl}
            alt="매물 이미지"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">
            {title || '제목 없음'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
              <p className="text-xs text-blue-600 font-bold mb-1">
                보증금/월세
              </p>
              <p className="font-bold text-gray-900">
                {formatMoney(deposit)} / {formatMoney(monthlyrent)}
              </p>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100/50">
              <p className="text-xs text-purple-600 font-bold mb-1">면적</p>
              <div className="flex items-center gap-1">
                <Ruler size={14} />
                <span className="font-bold text-gray-900">
                  {formatArea(size)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 mb-0.5">주소</p>
                <p>{roadaddress || address || '주소 정보 없음'}</p>
                {address && address !== roadaddress && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    (지번) {address}
                  </p>
                )}
              </div>
            </div>

            {name && (
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Home size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 mb-0.5">상호명</p>
                  <p>{name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText size={18} className="text-gray-400" />
            상세 설명
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed min-h-25">
            상권 내 위치한 매물입니다. 상세한 내용은 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

function formatMoney(value: number | null): string {
  if (!value) return '0';
  const won = value * 1000;
  if (won >= 100000000) {
    const eok = won / 100000000;
    return `${Number.isInteger(eok) ? eok : eok.toFixed(1)}억`;
  } else if (won >= 10000) {
    return `${Math.round(won / 10000).toLocaleString()}만`;
  }
  return `${(won / 10000).toFixed(1)}만`;
}

function formatArea(m2: number | null): string {
  if (!m2) return '0m²';
  const pyeong = (m2 / 3.3058).toFixed(1);
  return `${m2}m² (${pyeong}평)`;
}
