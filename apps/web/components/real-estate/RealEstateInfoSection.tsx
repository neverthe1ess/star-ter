'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Building2,
  MapPin,
  X,
  Home,
  ChevronLeft,
  Filter,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useMapStore } from '../../stores/useMapStore';
import { RealEstateItem } from '../../types/map-store-types';
import {
  fetchRealEstateAiSummary,
  formatRealEstateMetrics,
} from '../../services/ai.service';

type SortOption = 'latest' | 'deposit' | 'monthlyrent' | 'premium' | 'size';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'deposit', label: '보증금순' },
  { value: 'monthlyrent', label: '월세순' },
  { value: 'premium', label: '권리금순' },
  { value: 'size', label: '평수순' },
];

export default function RealEstateInfoSection() {
  const {
    selectedRealEstateItem,
    setSelectedRealEstateItem,
    realEstateList,
    filteredClusterCoords,
    setFilteredClusterCoords,
  } = useMapStore();

  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // AI 요약 상태
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiRequestRef = useRef<number>(0);

  const handleBack = () => {
    setSelectedRealEstateItem(null);
  };

  const handleClearFilter = () => {
    setFilteredClusterCoords(null);
  };

  // 클러스터 필터링 적용
  const filteredList = useMemo(() => {
    if (!filteredClusterCoords) return realEstateList;

    const { lat, lng } = filteredClusterCoords;
    return realEstateList.filter((item) => {
      if (!item.centerlatitude || !item.centerlongitude) return false;
      const itemLat = Math.round(item.centerlatitude * 1000000) / 1000000;
      const itemLng = Math.round(item.centerlongitude * 1000000) / 1000000;
      return itemLat === lat && itemLng === lng;
    });
  }, [realEstateList, filteredClusterCoords]);

  // 정렬 적용
  const displayList = useMemo(() => {
    const sorted = [...filteredList];

    switch (sortBy) {
      case 'deposit':
        return sorted.sort((a, b) => (a.deposit ?? 0) - (b.deposit ?? 0));
      case 'monthlyrent':
        return sorted.sort(
          (a, b) => (a.monthlyrent ?? 0) - (b.monthlyrent ?? 0),
        );
      case 'premium':
        return sorted.sort((a, b) => (a.premium ?? 0) - (b.premium ?? 0));
      case 'size':
        return sorted.sort((a, b) => (a.size ?? 0) - (b.size ?? 0));
      case 'latest':
      default:
        return sorted; // 기본 순서 유지 (최신순은 API에서 처리됨)
    }
  }, [filteredList, sortBy]);

  // AI 요약 호출 (디바운스 1.5초)
  useEffect(() => {
    if (displayList.length === 0) {
      setAiSummary('');
      return;
    }

    const requestId = ++aiRequestRef.current;
    setIsAiLoading(true);

    const timer = setTimeout(async () => {
      try {
        const metrics = formatRealEstateMetrics(displayList);
        const summary = await fetchRealEstateAiSummary(metrics);

        if (requestId === aiRequestRef.current) {
          setAiSummary(summary);
        }
      } catch (error) {
        console.error('AI 요약 호출 실패:', error);
        if (requestId === aiRequestRef.current) {
          setAiSummary('');
        }
      } finally {
        if (requestId === aiRequestRef.current) {
          setIsAiLoading(false);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [displayList]);

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
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 flex items-end gap-2">
              <span>부동산 매물</span>
              <span className="text-lg text-gray-500 font-normal">
                {displayList.length}
              </span>
            </h1>

            {/* 정렬 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span>
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-32">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        sortBy === option.value
                          ? 'text-blue-600 font-medium bg-blue-50'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 클러스터 필터 표시 */}
          {filteredClusterCoords && (
            <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <Filter size={14} className="text-blue-600" />
              <span className="text-sm text-blue-700 flex-1">
                같은 위치 매물 {displayList.length}건 표시 중
              </span>
              <button
                onClick={handleClearFilter}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <X size={14} />
                필터 해제
              </button>
            </div>
          )}
        </div>

        {/* AI 요약 박스 */}
        {displayList.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  {isAiLoading ? (
                    <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    AI 부동산 요약
                  </p>
                  {isAiLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-blue-200/50 rounded w-3/4"></div>
                      <div className="h-3 bg-blue-200/50 rounded w-full"></div>
                      <div className="h-3 bg-blue-200/50 rounded w-5/6"></div>
                    </div>
                  ) : aiSummary ? (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {aiSummary}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      요약을 생성하고 있습니다...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 리스트 목록 */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-4">
          {displayList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Building2 size={48} className="opacity-20 mb-4" />
              <p>지도 영역 내 매물이 없습니다.</p>
              <p className="text-sm mt-1">지도를 이동해보세요.</p>
            </div>
          ) : (
            displayList.map((item) => (
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
            {formatMoney(deposit)} / {formatMoney(monthlyrent)}
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

// 상세 뷰 컴포넌트 - 모든 DB 필드 표시
function DetailView({ item }: { item: RealEstateItem }) {
  const {
    name,
    address,
    roadaddress,
    deposit,
    monthlyrent,
    premium,
    maintenancefee,
    floor,
    groundfloor,
    size,
    previewphotourl,
    title,
    businesslargecodename,
    businessmiddlecodename,
    nearsubwaystation,
    ismoveindate,
    moveindate,
    areaprice,
    createddateutc,
    editeddateutc,
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

      <div className="p-6 space-y-4">
        {/* 제목 및 업종 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 text-lg mb-2">
            {title || '제목 없음'}
          </h2>
          {(businesslargecodename || businessmiddlecodename) && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {businesslargecodename && (
                <span className="px-2 py-0.5 bg-gray-100 rounded">
                  {businesslargecodename}
                </span>
              )}
              {businessmiddlecodename && (
                <span className="px-2 py-0.5 bg-gray-100 rounded">
                  {businessmiddlecodename}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 가격 정보 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">💰 가격 정보</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
              <p className="text-xs text-blue-600 font-bold mb-1">보증금</p>
              <p className="font-bold text-gray-900">{formatMoney(deposit)}</p>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
              <p className="text-xs text-blue-600 font-bold mb-1">월세</p>
              <p className="font-bold text-gray-900">
                {formatMoney(monthlyrent)}
              </p>
            </div>
            <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100/50">
              <p className="text-xs text-orange-600 font-bold mb-1">권리금</p>
              <p className="font-bold text-gray-900">{formatMoney(premium)}</p>
            </div>
            <div className="p-3 bg-green-50/50 rounded-lg border border-green-100/50">
              <p className="text-xs text-green-600 font-bold mb-1">관리비</p>
              <p className="font-bold text-gray-900">
                {formatMoney(maintenancefee)}
              </p>
            </div>
            {areaprice && (
              <div className="col-span-2 p-3 bg-purple-50/50 rounded-lg border border-purple-100/50">
                <p className="text-xs text-purple-600 font-bold mb-1">
                  평당 가격
                </p>
                <p className="font-bold text-gray-900">
                  {formatMoney(areaprice)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 건물 정보 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">🏢 건물 정보</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-1">면적</p>
              <p className="font-bold text-gray-900">{formatArea(size)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-1">층수</p>
              <p className="font-bold text-gray-900">
                {floor !== null ? formatFloor(floor) : '-'}
                {groundfloor !== null && ` / 지상 ${groundfloor}층`}
              </p>
            </div>
          </div>
        </div>

        {/* 위치 정보 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">📍 위치 정보</h3>
          <div className="space-y-3">
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

            {nearsubwaystation && (
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-gray-400">🚇</span>
                <div>
                  <p className="font-medium text-gray-900 mb-0.5">
                    근처 지하철역
                  </p>
                  <p>{nearsubwaystation}</p>
                </div>
              </div>
            )}

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

        {/* 입주 정보 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">📅 입주 정보</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-1">
                즉시 입주
              </p>
              <p className="font-bold text-gray-900">
                {ismoveindate === true
                  ? '가능'
                  : ismoveindate === false
                    ? '불가능'
                    : '-'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-1">
                입주 가능일
              </p>
              <p className="font-bold text-gray-900">
                {moveindate
                  ? new Date(moveindate).toLocaleDateString('ko-KR')
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 등록 정보 */}
        <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-400 space-y-1">
          {createddateutc && (
            <p>
              등록일: {new Date(createddateutc).toLocaleDateString('ko-KR')}
            </p>
          )}
          {editeddateutc && (
            <p>수정일: {new Date(editeddateutc).toLocaleDateString('ko-KR')}</p>
          )}
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

function formatFloor(floor: number): string {
  if (floor < 0) {
    return `지하 ${Math.abs(floor)}층`;
  }
  return `${floor}층`;
}
