'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ChevronDown, X } from 'lucide-react';
import { motion } from 'motion/react';
import {
  fetchLocationRanking,
  fetchPopulationRanking,
  fetchClosureRateRanking,
  fetchMZRanking,
  LocationRankItem,
  PopulationRankItem,
  ClosureRateRankItem,
  INDUSTRY_CATEGORIES,
  AGE_GROUP_OPTIONS,
  TIME_SLOT_OPTIONS,
  SortBy,
  AgeGroup,
  TimeSlot,
} from '@/services/location/location.service';
import {
  getRecommendations,
  ScoredLocation,
} from '@/services/location/locationRecommend.service';
import { getOnboarding } from '@/services/user/user.api';
import { useUserStore } from '@/store/use-user-store';

export { type LocationRankItem } from '@/services/location/location.service';

const getBarColor = (percentage: number) => {
  if (percentage >= 100) return '#2C2F6C'; // main navy
  if (percentage >= 70) return '#4C5BD4';
  if (percentage >= 50) return '#9AA4FF';
  return '#DDE1FF';
};

const ITEMS_PER_PAGE = 20;

// 탭 타입 확인
const isPopulationTab = (tab: string) => tab === '유동인구 순';
const isClosureRateTab = (tab: string) => tab === '폐업률 높은 순';
const isMZTab = (tab: string) => tab === 'MZ 선호 순';
const isRecommendTab = (tab: string) => tab === '맞춤 추천';

export function LocationSearchPage({}: { onBack?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 초기 탭 읽기
  const initialSubTab = searchParams.get('tab') || '평균 매출 순';

  const [activeTab, setActiveTab] = useState('실시간 상권 차트');
  const [subTab, setSubTab] = useState(initialSubTab);
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const [industryCode, setIndustryCode] = useState('');
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);

  // 로그인 상태
  const authUser = useUserStore((state) => state.authUser);

  // 매출 데이터
  const [rankData, setRankData] = useState<LocationRankItem[]>([]);
  // 유동인구 데이터
  const [populationData, setPopulationData] = useState<PopulationRankItem[]>(
    [],
  );
  // 폐업률 데이터
  const [closureData, setClosureData] = useState<ClosureRateRankItem[]>([]);
  // 맞춤 추천 데이터
  const [recommendData, setRecommendData] = useState<ScoredLocation[]>([]);
  // 유동인구 필터
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('total');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('total');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 검색어 디바운스
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const tabs = ['실시간 상권 차트'];
  const subTabs = [
    '맞춤 추천',
    '평균 매출 순',
    '매출 성장 순',
    '유동인구 순',
    '폐업률 높은 순',
    'MZ 선호 순',
  ];

  // 현재 선택된 업종명 찾기
  const selectedIndustryName = useMemo(() => {
    if (!industryCode) return '전체 업종';
    for (const category of INDUSTRY_CATEGORIES) {
      const found = category.items.find((item) => item.code === industryCode);
      if (found) return found.name;
    }
    return '전체 업종';
  }, [industryCode]);

  // 대분류에 속한 소분류 목록
  const minorCategories = useMemo(() => {
    if (!selectedMajor) return null;
    return (
      INDUSTRY_CATEGORIES.find((c) => c.major === selectedMajor)?.items || []
    );
  }, [selectedMajor]);

  // subTab에 따른 정렬 방식 결정
  const getSortBy = (tab: string): SortBy => {
    if (tab === '매출 성장 순') return 'growth';
    return 'average';
  };

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setDisplayCount(ITEMS_PER_PAGE);

      try {
        if (isRecommendTab(subTab)) {
          // 맞춤 추천
          if (!authUser) {
            setRecommendData([]);
            setError('로그인이 필요합니다.');
            return;
          }

          const onboarding = await getOnboarding();
          if (!onboarding || !onboarding.completed) {
            setRecommendData([]);
            setError('온보딩을 완료해주세요.');
            return;
          }

          if (
            !onboarding.age ||
            !onboarding.region ||
            !onboarding.operatingTime ||
            !onboarding.capital
          ) {
            setRecommendData([]);
            setError('온보딩 정보가 부족합니다.');
            return;
          }

          const response = await getRecommendations({
            age: onboarding.age,
            region: onboarding.region,
            operatingTime: onboarding.operatingTime,
            capital: onboarding.capital,
            industryCode: onboarding.industryCode,
          });

          if (response) {
            setRecommendData(response.locations);
          } else {
            setRecommendData([]);
          }
        } else if (isPopulationTab(subTab)) {
          // 유동인구 순
          const data = await fetchPopulationRanking(
            'commercial',
            ageGroup,
            timeSlot,
            debouncedQuery,
          );
          setPopulationData(data);
        } else if (isClosureRateTab(subTab)) {
          // 폐업률 낮은 순
          const data = await fetchClosureRateRanking(
            'commercial',
            industryCode || undefined,
            debouncedQuery,
          );
          setClosureData(data);
        } else if (isMZTab(subTab)) {
          // MZ 선호 순
          const data = await fetchMZRanking('commercial', debouncedQuery);
          // MZ 랭킹은 PopulationRankItem 형식을 따름
          setPopulationData(data);
        } else {
          // 매출 순
          const sortBy = getSortBy(subTab);
          const data = await fetchLocationRanking(
            'commercial',
            industryCode || undefined,
            sortBy,
            debouncedQuery,
          );
          setRankData(data);
        }
      } catch (err) {
        console.error('Failed to fetch ranking:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [subTab, industryCode, ageGroup, timeSlot, debouncedQuery, authUser]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsIndustryOpen(false);
      }
    };

    if (isIndustryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isIndustryOpen]);

  const handleLocationClick = (
    item: LocationRankItem | PopulationRankItem | ClosureRateRankItem,
  ) => {
    router.push(`/locations/detail/${item.code}`);
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleClearFilter = () => {
    setIndustryCode('');
    setSelectedMajor(null);
  };

  // 현재 탭에 따른 데이터
  const currentData = isRecommendTab(subTab)
    ? recommendData
    : isPopulationTab(subTab) || isMZTab(subTab)
      ? populationData
      : isClosureRateTab(subTab)
        ? closureData
        : rankData;
  const displayedData = currentData.slice(0, displayCount);
  const hasMore = displayCount < currentData.length;

  return (
    <div className="flex flex-1 flex-col h-screen bg-[#f7f7f8] py-4 pr-4 overflow-hidden">
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-10 border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center gap-8">
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-5 text-lg font-bold transition-all ${
                    activeTab === tab
                      ? 'text-slate-900'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-3px bg-slate-900 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* 검색 입력창 */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="상권명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-10 py-4 flex flex-col gap-3 shrink-0 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                {subTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSubTab(tab)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      subTab === tab
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* 필터 영역 - 오른쪽에 고정 */}
            <div className="flex items-center gap-2">
              {/* 유동인구 탭: 연령대 + 시간대 필터 */}
              {isPopulationTab(subTab) ? (
                <>
                  {/* 연령대 드롭다운 */}
                  <div className="flex bg-slate-100 p-0.5 rounded-lg">
                    {AGE_GROUP_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAgeGroup(opt.value)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                          ageGroup === opt.value
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* 시간대 드롭다운 */}
                  <div className="flex bg-slate-100 p-0.5 rounded-lg">
                    {TIME_SLOT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTimeSlot(opt.value)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                          timeSlot === opt.value
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : isMZTab(subTab) ||
                isRecommendTab(
                  subTab,
                ) /* MZ 탭, 맞춤 추천 탭: 필터 없음 */ ? null : (
                /* 매출 탭: 업종 필터 */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setIsIndustryOpen(!isIndustryOpen);
                      setSelectedMajor(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      industryCode
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {selectedIndustryName}
                    {industryCode ? (
                      <X
                        className="w-4 h-4 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearFilter();
                        }}
                      />
                    ) : (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isIndustryOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {isIndustryOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      {!selectedMajor ? (
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase">
                            대분류 선택
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {INDUSTRY_CATEGORIES.map((category) => (
                              <button
                                key={category.major}
                                onClick={() => setSelectedMajor(category.major)}
                                className="px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                {category.major}
                                <span className="text-slate-400 ml-1 text-xs">
                                  ({category.items.length})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-slate-50">
                            <button
                              onClick={() => setSelectedMajor(null)}
                              className="text-xs font-medium text-slate-500 hover:text-slate-700"
                            >
                              ← 뒤로
                            </button>
                            <span className="text-sm font-bold text-slate-900">
                              {selectedMajor}
                            </span>
                          </div>
                          <div className="max-h-64 overflow-y-auto p-2">
                            {minorCategories?.map((item) => (
                              <button
                                key={item.code}
                                onClick={() => {
                                  setIndustryCode(item.code);
                                  setIsIndustryOpen(false);
                                  setSelectedMajor(null);
                                }}
                                className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                                  industryCode === item.code
                                    ? 'text-blue-600 font-bold bg-blue-50'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 테이블 헤더 - 탭에 따라 다르게 표시 */}
        <div
          className="px-6 py-3 grid items-center text-[13px] font-bold text-slate-400 shrink-0 border-b border-gray-50 bg-slate-50/30 gap-4"
          style={{
            gridTemplateColumns: isRecommendTab(subTab)
              ? '1fr 160px 290px'
              : isPopulationTab(subTab)
                ? '1fr 180px 100px 150px'
                : isMZTab(subTab)
                  ? '1fr 190px 100px 150px'
                  : isClosureRateTab(subTab)
                    ? '1fr 80px 190px 200px 150px'
                    : '1fr 120px 190px 130px 190px',
          }}
        >
          {isRecommendTab(subTab) ? (
            <>
              <div className="text-left">순위 / 상권명</div>
              <div className="text-center">매칭 점수</div>
              <div className="text-center">상세 점수</div>
            </>
          ) : isPopulationTab(subTab) ? (
            <>
              <div className="text-left">순위 / 상권명</div>
              <div className="text-center">유동인구 (명)</div>
              <div className="text-center">등락률</div>
              <div className="text-center">상권 상태</div>
            </>
          ) : isMZTab(subTab) ? (
            <>
              <div className="text-left">순위 / 상권명</div>
              <div className="text-center">MZ 인구 (명)</div>
              <div className="text-center">MZ 비중</div>
              <div className="text-center">상권 상태</div>
            </>
          ) : isClosureRateTab(subTab) ? (
            <>
              <div className="text-left">순위 / 상권명</div>
              <div className="text-center">폐업률</div>
              <div className="text-center">폐업 점포</div>
              <div className="text-center">점포 수 변화 (전분기 → 현분기)</div>
              <div className="text-center">상권 상태</div>
            </>
          ) : (
            <>
              <div className="text-left">순위 · 상권명 / 점포 수</div>
              <div className="text-center">평균 매출(분기)</div>
              <div className="text-center">전분기 대비</div>
              <div className="text-center">분기 총 매출</div>
              <div className="text-center">성별 매출 비율 (남/여)</div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10 no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              {error}
            </div>
          ) : currentData.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              데이터가 없습니다.
            </div>
          ) : isRecommendTab(subTab) ? (
            // 맞춤 추천 리스트
            (displayedData as ScoredLocation[]).map((item, index) => (
              <button
                key={item.id}
                onClick={() => router.push(`/locations/detail/${item.id}`)}
                className="w-full py-4 items-center hover:bg-slate-50/80 rounded-2xl transition-all group relative grid gap-4 text-left"
                style={{ gridTemplateColumns: '1fr 160px 290px' }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-lg font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                    {index + 1}
                  </span>
                  <div className="text-left">
                    <div className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </div>
                  </div>
                </div>

                {/* 점수 뱃지 - 기본 표시 */}
                <div className="text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      item.totalScore >= 90
                        ? 'bg-emerald-50 text-emerald-600'
                        : item.totalScore >= 70
                          ? 'bg-blue-50 text-blue-600'
                          : item.totalScore >= 50
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.totalScore.toFixed(1)}점
                  </span>
                </div>

                {/* 호버 시 점수 그래프 표시 */}
                <div className="flex items-center justify-center">
                  <div className="text-xs text-slate-400 group-hover:hidden">
                    마우스를 올려 상세 점수 보기
                  </div>
                  <div className="hidden group-hover:block w-full">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12">
                          타깃연령
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round(item.scores.age * 100)}%`,
                              backgroundColor: getBarColor(
                                Math.round(item.scores.age * 100),
                              ),
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 w-8">
                          {Math.round(item.scores.age * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12">
                          창업비용
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round(item.scores.rent * 100)}%`,
                              backgroundColor: getBarColor(
                                Math.round(item.scores.rent * 100),
                              ),
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 w-8">
                          {Math.round(item.scores.rent * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12">
                          상권테마
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round(item.scores.region * 100)}%`,
                              backgroundColor: getBarColor(
                                Math.round(item.scores.region * 100),
                              ),
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 w-8">
                          {Math.round(item.scores.region * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12">
                          운영시간
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round(item.scores.time * 100)}%`,
                              backgroundColor: getBarColor(
                                Math.round(item.scores.time * 100),
                              ),
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 w-8">
                          {Math.round(item.scores.time * 100)}%
                        </span>
                      </div>
                      {item.scores.industry !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 w-12">
                            업종적합
                          </span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.round(item.scores.industry * 100)}%`,
                                backgroundColor: getBarColor(
                                  Math.round(item.scores.industry * 100),
                                ),
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-600 w-8">
                            {Math.round(item.scores.industry * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : isPopulationTab(subTab) ? (
            // 유동인구 리스트
            (displayedData as PopulationRankItem[]).map((item) => (
              <button
                key={`${item.id}-${item.rank}-${item.name}`}
                onClick={() => handleLocationClick(item)}
                className="w-full py-4 items-center hover:bg-slate-50/80 rounded-2xl transition-all group grid gap-4 text-left"
                style={{ gridTemplateColumns: '1fr 180px 100px 150px' }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-lg font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                    {item.rank}
                  </span>
                  <div className="text-left">
                    <div className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </div>
                  </div>
                </div>

                <div className="text-center text-[15px] font-bold text-slate-900">
                  {item.population}
                </div>

                <div className="flex justify-center">
                  <div
                    className={`px-2 py-1 rounded-lg text-xs font-black min-w-15 ${
                      item.growthRate > 0
                        ? 'bg-red-50 text-red-500'
                        : 'bg-blue-50 text-blue-500'
                    }`}
                  >
                    {item.growthRate > 0 ? '▲' : '▼'}{' '}
                    {Math.abs(item.growthRate).toFixed(1)}%
                  </div>
                </div>

                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      item.statusType === 'hot'
                        ? 'bg-red-50 text-red-600'
                        : item.statusType === 'stable'
                          ? 'bg-green-50 text-green-600'
                          : item.statusType === 'danger'
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </button>
            ))
          ) : isMZTab(subTab) ? (
            // MZ 리스트 (PopulationRankItem 재사용)
            (displayedData as PopulationRankItem[]).map((item) => (
              <button
                key={`${item.id}-${item.rank}-${item.name}`}
                onClick={() => handleLocationClick(item)}
                className="w-full py-4 items-center hover:bg-slate-50/80 rounded-2xl transition-all group grid gap-4 text-left"
                style={{ gridTemplateColumns: '1fr 190px 100px 150px' }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-lg font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                    {item.rank}
                  </span>
                  <div className="text-left">
                    <div className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </div>
                  </div>
                </div>

                <div className="text-center text-[15px] font-bold text-slate-900">
                  {item.population}
                </div>

                <div className="flex justify-center">
                  <div className="px-2 py-1 rounded-lg text-xs font-black min-w-15 bg-violet-50 text-violet-600">
                    {item.growthRate.toFixed(1)}%
                  </div>
                </div>

                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      item.statusType === 'hot'
                        ? 'bg-red-50 text-red-600'
                        : item.statusType === 'stable'
                          ? 'bg-green-50 text-green-600'
                          : item.statusType === 'danger'
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </button>
            ))
          ) : isClosureRateTab(subTab) ? (
            // 폐업률 리스트
            (displayedData as ClosureRateRankItem[]).map((item) => (
              <button
                key={`${item.id}-${item.rank}-${item.name}`}
                onClick={() => handleLocationClick(item)}
                className="w-full py-4 items-center hover:bg-slate-50/80 rounded-2xl transition-all group grid gap-4 text-left"
                style={{ gridTemplateColumns: '1fr 80px 190px 200px 150px' }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-lg font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                    {item.rank}
                  </span>
                  <div className="text-left">
                    <div className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </div>
                  </div>
                </div>

                <div className="text-center text-[15px] font-bold text-slate-900">
                  {item.closureRate}%
                </div>

                <div className="text-center text-[15px] font-medium text-slate-600">
                  <span className="text-red-500 font-bold">
                    {item.closedStoreCount}
                  </span>
                  개 폐업
                </div>

                <div className="flex justify-center items-center gap-2 text-sm text-slate-500">
                  <span>{item.previousStoreCount}개</span>
                  <span className="text-slate-300">→</span>
                  <span className="font-bold text-slate-900">
                    {item.currentStoreCount}개
                  </span>
                </div>

                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      item.statusType === 'hot'
                        ? 'bg-red-50 text-red-600'
                        : item.statusType === 'stable'
                          ? 'bg-green-50 text-green-600'
                          : item.statusType === 'danger'
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </button>
            ))
          ) : (
            // 매출 리스트 (기본)
            (displayedData as LocationRankItem[]).map((item) => (
              <button
                key={`${item.id}-${item.rank}-${item.name}`}
                onClick={() => handleLocationClick(item)}
                className="w-full py-4 items-center hover:bg-slate-50/80 rounded-2xl transition-all group grid gap-4 text-left"
                style={{ gridTemplateColumns: '1fr 120px 190px 130px 190px' }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-lg font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                    {item.rank}
                  </span>

                  <div className="text-left">
                    <div className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[12px] font-medium text-slate-400">
                      점포 수: {item.storeCount}개
                    </div>
                  </div>
                </div>

                <div className="text-center text-[15px] font-bold text-slate-900">
                  {item.avgRevenue}
                </div>

                <div className="w-full flex justify-center items-center">
                  <div
                    className={`px-2 py-1 rounded-lg text-xs font-black min-w-20 ${
                      item.growthRate > 0
                        ? 'bg-red-50 text-red-500'
                        : 'bg-blue-50 text-blue-500'
                    }`}
                  >
                    {item.growthRate > 0 ? '+' : ''}
                    {item.growthRate.toFixed(1)}%
                  </div>
                </div>

                <div className="text-center text-[15px] font-bold text-slate-900">
                  {item.totalRevenue}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="flex w-32 h-1.5 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="h-full bg-blue-500 transition-all duration-1000"
                      style={{ width: `${item.ratio.male}%` }}
                    />
                    <div
                      className="h-full bg-red-500 transition-all duration-1000"
                      style={{ width: `${item.ratio.female}%` }}
                    />
                  </div>
                  <div className="flex justify-between w-32 text-[11px] font-black text-slate-400">
                    <span className="text-blue-500">{item.ratio.male}</span>
                    <span className="text-red-500">{item.ratio.female}</span>
                  </div>
                </div>
              </button>
            ))
          )}

          {hasMore && !isLoading && !error && (
            <div className="mt-8 mb-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-gray-50 text-slate-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all"
              >
                더 보기 ({displayCount} / {currentData.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
