'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMapStore } from '@/stores/useMapStore';
import { geocodeAddress } from '@/services/geocoding/geocoding.service';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type AreaRecommendation = {
  area_cd: string;
  area_level: 'commercial' | 'gu' | 'dong';
  area_nm: string;
  recommend_title: string;
  recommend_reason: string;
};

const AREA_LEVEL_LABEL: Record<string, string> = {
  commercial: '상권',
  gu: '자치구',
  dong: '행정동',
  city: '시',
};

export default function AiInputSection() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [areaResults, setAreaResults] = useState<AreaRecommendation[] | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const { selectArea, setZoom } = useMapStore();

  useEffect(() => {
    if (!isLoading) {
      setLoadingDots('');
      return;
    }

    const frames = ['.', '..', '...'];
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % frames.length;
      setLoadingDots(frames[index]);
    }, 800);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setStatusMessage('질문을 입력해 주세요.');
      setAreaResults(null);
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setAreaResults(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/ai/area?message=${encodeURIComponent(trimmed)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = (await res.json()) as unknown;
      const list = Array.isArray(data) ? (data as AreaRecommendation[]) : [];

      setAreaResults(list);
      if (list.length === 0) {
        setStatusMessage(
          '추천 결과가 없어요. 다른 질문으로 다시 시도해 주세요.',
        );
      }
    } catch (error) {
      console.error('Failed to fetch area recommendations', error);
      setAreaResults([]);
      setStatusMessage('요청에 실패했어요. 다시 질문해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardRedirect = async (item: AreaRecommendation) => {
    const areaType = item.area_level || 'commercial';
    const geocodeQuery =
      areaType === 'commercial' ? item.area_nm : `서울특별시 ${item.area_nm}`;
    const result = await geocodeAddress(geocodeQuery);

    const coords = result
      ? { lat: result.lat, lng: result.lng }
      : { lat: 37.5665, lng: 126.9780 };

    let polygonData: number[][][][] | number[][][] | number[][] | undefined;
    if (API_BASE_URL && item.area_cd) {
      let polygonEndpoint = '';
      if (areaType === 'commercial') {
        polygonEndpoint = `${API_BASE_URL}/polygon/commercial/code?code=${item.area_cd}`;
      } else if (areaType === 'dong') {
        polygonEndpoint = `${API_BASE_URL}/polygon/dong/code?code=${item.area_cd}`;
      } else if (areaType === 'gu') {
        polygonEndpoint = `${API_BASE_URL}/polygon/gu/code?code=${item.area_cd}`;
      }

      if (polygonEndpoint) {
        try {
          const polygonRes = await fetch(polygonEndpoint);
          if (polygonRes.ok) {
            const polygonJson = await polygonRes.json();
            if (polygonJson?.polygons?.coordinates) {
              polygonData = polygonJson.polygons.coordinates;
            } else if (polygonJson?.polygons) {
              polygonData = polygonJson.polygons;
            }
          }
        } catch (err) {
          console.error('Failed to fetch polygon data:', err);
        }
      }
    }

    selectArea(
      {
        name: item.area_nm,
        coords,
        type: areaType,
        code: item.area_cd,
      },
      polygonData
        ? {
            commercialName: item.area_nm,
            commercialCode: item.area_cd,
            x: coords.lng,
            y: coords.lat,
            polygons: polygonData,
            level: areaType,
          }
        : undefined,
    );

    router.push('/analysis');
  };

  const isSubmitDisabled = isLoading || query.trim().length === 0;

  return (
    <div className="w-full bg-white px-6 py-8 border-b border-gray-100">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        {/* Title / Greeting */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600 fill-blue-100" />
            <span>무엇을 도와드릴까요?</span>
          </h1>
          <p className="text-gray-500 text-sm">
            상권 분석, 창업 추천, 매출 예측 등 궁금한 점을 자연스럽게
            물어보세요.
          </p>
        </div>

        {/* Large Chat Input */}
        <div className="w-full relative group">
          <div
            className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg transition-opacity duration-500 ${
              isLoading
                ? 'opacity-100 animate-pulse blur-2xl scale-105 -inset-2 from-blue-500/45 to-purple-500/40'
                : 'opacity-0 group-hover:opacity-100'
            }`}
          />
          <div
            className={`relative flex items-center bg-white rounded-2xl border shadow-sm transition-all focus-within:shadow-md focus-within:border-blue-400 ${
              isLoading
                ? 'border-blue-300 ring-2 ring-blue-400/40 shadow-[0_0_40px_rgba(59,130,246,0.35)]'
                : 'border-gray-200'
            }`}
          >
            <textarea
              placeholder="예: 강남역에서 30대 여성이 좋아하는 카페 창업하려면?"
              rows={1}
              value={query}
              className="w-full bg-transparent px-6 py-4 pr-14 text-base placeholder:text-gray-400 focus:outline-none resize-none overflow-hidden min-h-[60px] "
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height =
                  e.currentTarget.scrollHeight + 'px';
              }}
            />
            <button
              className={`absolute right-3 p-2 rounded-xl text-white transition-colors ${
                isSubmitDisabled
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-900 hover:bg-black'
              }`}
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="text-sm text-gray-500 font-medium">
            답변을 찾는 중{loadingDots}
          </p>
        )}

        {statusMessage && !isLoading && (
          <p className="text-sm text-gray-500 font-medium">{statusMessage}</p>
        )}

        {areaResults && areaResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {areaResults.map((item, index) => (
              <button
                key={`${item.area_cd}-${item.recommend_title}-${index}`}
                type="button"
                className="flex flex-col items-start p-4 rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all text-left"
                onClick={() => handleCardRedirect(item)}
              >
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">
                    {AREA_LEVEL_LABEL[item.area_level] || item.area_level}
                  </span>
                  <span className="font-semibold text-gray-700">
                    {item.area_nm}
                  </span>
                </div>
                <span className="font-bold text-gray-900 text-sm mt-2">
                  {item.recommend_title}
                </span>
                <p className="text-xs text-gray-500 leading-relaxed font-medium mt-1">
                  {item.recommend_reason}
                </p>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
function setZoom(arg0: number) {
  throw new Error('Function not implemented.');
}
