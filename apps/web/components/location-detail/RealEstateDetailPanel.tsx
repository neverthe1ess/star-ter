'use client';

import Image from 'next/image';
import { X, MapPin, Building2, Calendar, Train } from 'lucide-react';
import type { RealEstateItem } from './types';
import { formatToKoreaCurrency, formatArea, formatFloor } from './utils';

/**
 * 【RealEstateDetailPanel 컴포넌트】
 * 
 * 지도에서 마커를 클릭했을 때 표시되는 매물 상세정보 패널입니다.
 * 
 * 【주요 개념】
 * 1. 조건부 렌더링: 부모 컴포넌트에서 selectedItem이 있을 때만 이 컴포넌트를 렌더링
 * 2. 콜백 함수: onClose prop으로 부모에게 "닫기" 이벤트를 전달
 * 3. 오버레이 패턴: fixed 포지션으로 화면 위에 떠있는 UI 구현
 */

interface RealEstateDetailPanelProps {
  item: RealEstateItem;  // 표시할 매물 데이터
  onClose: () => void;    // 닫기 버튼 클릭 시 호출될 콜백 함수
}

export function RealEstateDetailPanel({ item, onClose }: RealEstateDetailPanelProps) {
  return (
    /**
     * 【오버레이 구조】
     * 1. 외부 div: 화면 전체를 덮는 반투명 배경 (클릭하면 닫힘)
     * 2. 내부 div: 실제 패널 컨텐츠 (클릭해도 닫히지 않음 - stopPropagation)
     */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}  // 배경 클릭 시 닫기
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}  // 패널 내부 클릭은 닫기 방지
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* 이미지 영역 */}
        <div className="relative w-full h-56 bg-gray-100">
          {item.previewphotourl ? (
            <Image
              src={item.previewphotourl}
              alt="매물 사진"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          {/* 즉시입주 뱃지 */}
          {item.ismoveindate && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              즉시입주
            </div>
          )}
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-14rem)]">
          {/* 가격 정보 - 가장 중요한 정보이므로 크게 표시 */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {formatToKoreaCurrency(item.deposit)} / {formatToKoreaCurrency(item.monthlyrent)}
            </h2>
            <p className="text-gray-500 mt-1">보증금 / 월세</p>
          </div>

          {/* 제목/주소 */}
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">
                {item.title || item.name || '상가 매물'}
              </p>
              <p className="text-gray-500 text-sm">
                {item.roadaddress || item.address || '-'}
              </p>
            </div>
          </div>

          {/* 상세 정보 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">면적</p>
              <p className="font-bold text-gray-900">{formatArea(item.size)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">층수</p>
              <p className="font-bold text-gray-900">{formatFloor(item.floor, item.groundfloor)}</p>
            </div>
            {item.premium && item.premium > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">권리금</p>
                <p className="font-bold text-gray-900">{formatToKoreaCurrency(item.premium)}</p>
              </div>
            )}
            {item.maintenancefee && item.maintenancefee > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">관리비</p>
                <p className="font-bold text-gray-900">{formatToKoreaCurrency(item.maintenancefee)}</p>
              </div>
            )}
          </div>

          {/* 태그 정보 */}
          <div className="flex flex-wrap gap-2">
            {item.nearsubwaystation && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Train className="w-4 h-4" />
                {item.nearsubwaystation}
              </span>
            )}
            {item.businessmiddlecodename && (
              <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                {item.businessmiddlecodename}
              </span>
            )}
            {item.businesslargecodename && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                {item.businesslargecodename}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
