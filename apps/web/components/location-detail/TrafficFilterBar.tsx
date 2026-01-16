'use client';

import { useState } from 'react';
import { Play, Pause, Clock, Users, Calendar } from 'lucide-react';
import { GenderFilter, AgeFilter, AGE_SLIDER_OPTIONS } from './types';

/**
 * 【TrafficFilterBar 컴포넌트】
 *
 * 유동인구 히트맵 필터바. 0~23시 슬라이더와 연령대 불연속 슬라이더를 제공합니다.
 */

interface TrafficFilterBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentHour: number; // 0~23
  onHourChange: (hour: number) => void;
  genderFilter: GenderFilter;
  ageFilter: AgeFilter;
  onFilterChange: (gender: GenderFilter, age: AgeFilter) => void;
}

export function TrafficFilterBar({
  isPlaying,
  onTogglePlay,
  currentHour,
  onHourChange,
  genderFilter,
  ageFilter,
  onFilterChange,
}: TrafficFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 시간 라벨 포맷 (예: "09시", "18시")
  const hourLabel = `${currentHour.toString().padStart(2, '0')}시`;

  // 현재 연령대 라벨
  const currentAgeLabel =
    AGE_SLIDER_OPTIONS.find((opt) => opt.value === ageFilter)?.label || '전체';
  const currentAgeIndex = AGE_SLIDER_OPTIONS.findIndex(
    (opt) => opt.value === ageFilter,
  );

  return (
    <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
      <style>{`
        @keyframes spring-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          60% { opacity: 1; transform: translateY(-5px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-spring-up { animation: spring-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes pulse-play {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-play { animation: pulse-play 1.5s ease-in-out infinite; }
        
        /* 커스텀 슬라이더 스타일 */
        .time-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff5e00ff, #ff5e00ff);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          border: 3px solid white;
          margin-top: -8px; /* 트랙 중앙 정렬 ((8px - 24px) / 2) */
        }
        .time-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(to right, #1e3a8a 0%, #ff5e00ff 50%, #1e3a8a 100%);
        }
        .age-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #71bcf5ff, #1e3a8a);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(34, 197, 94, 0.5);
          border: 2px solid white;
          margin-top: -7px; /* 트랙 중앙 정렬 ((6px - 20px) / 2) */
        }
        .age-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, #dcfce7, #1e3a8a);
        }
      `}</style>

      {isOpen ? (
        <div className="w-full max-w-[440px] bg-white/40 backdrop-blur-2xl rounded-[40px] p-6 shadow-2xl border border-white/40 pointer-events-auto animate-spring-up ring-1 ring-black/5">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-gray-900 font-heading text-h3 leading-tight">
                  유동인구 히트맵
                </p>
                <p className="text-blue-600 text-body font-strong mt-0.5">
                  {hourLabel} · {currentAgeLabel}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 hover:bg-white/60 transition-colors text-gray-600 backdrop-blur-sm"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 시간대 슬라이더 (0~23시) */}
          <div className="bg-white/30 rounded-3xl p-4 border border-white/50 shadow-sm mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-h4 font-heading tracking-wide flex items-center gap-2">
                <Clock className="w-5 h-5" />
                시간대
              </span>
              <div className="flex items-center gap-3">
                <span className="text-orange-500 font-bold text-h4">
                  {hourLabel}
                </span>
                <button
                  onClick={onTogglePlay}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-caption transition-all ${
                    isPlaying
                      ? 'bg-orange-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 시간 슬라이더 */}
            <input
              type="range"
              min="0"
              max="23"
              value={currentHour}
              onChange={(e) => onHourChange(parseInt(e.target.value))}
              className="time-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-tiny text-gray-500 mt-1 px-1">
              <span>0시</span>
              <span>6시</span>
              <span>12시</span>
              <span>18시</span>
              <span>23시</span>
            </div>
          </div>

          {/* 성별 필터 */}
          <div className="bg-white/30 rounded-3xl p-4 border border-white/50 shadow-sm mb-4">
            <span className="text-gray-600 text-h4 font-heading tracking-wide flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              성별
            </span>
            <div className="flex gap-2">
              {(['all', 'male', 'female'] as GenderFilter[]).map((g) => (
                <button
                  key={g}
                  onClick={() => onFilterChange(g, ageFilter)}
                  className={`flex-1 py-2 rounded-xl font-heading transition-all ${
                    genderFilter === g
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white/50 text-gray-600 hover:bg-white/70'
                  }`}
                >
                  {g === 'all' ? '전체' : g === 'male' ? '남성' : '여성'}
                </button>
              ))}
            </div>
          </div>

          {/* 연령대 슬라이더 */}
          <div className="bg-white/30 rounded-3xl p-4 border border-white/50 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-h4 font-heading tracking-wide flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                연령대
              </span>
              <span className="text-blue-900 font-bold text-h4">
                {currentAgeLabel}
              </span>
            </div>

            {/* 연령대 슬라이더 (불연속) */}
            <input
              type="range"
              min="0"
              max={AGE_SLIDER_OPTIONS.length - 1}
              value={currentAgeIndex}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                onFilterChange(genderFilter, AGE_SLIDER_OPTIONS[idx].value);
              }}
              className="age-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-tiny text-gray-500 mt-1">
              {AGE_SLIDER_OPTIONS.map((opt) => (
                <span key={opt.value} className="text-center">
                  {opt.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group pointer-events-auto flex items-center gap-5 bg-white/40 backdrop-blur-2xl rounded-full pl-4 pr-8 py-4 shadow-xl border border-white/40 hover:bg-white/50 transition-all duration-300 hover:scale-[1.03] active:scale-95 ring-1 ring-black/5"
        >
          <div
            className={`w-12 h-12 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300 ${isPlaying ? 'animate-pulse-play' : ''}`}
          >
            <Users className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-gray-900 font-heading text-h4 leading-none mb-1">
              {hourLabel}
            </span>
            <span className="text-blue-700 text-body font-medium">
              {isPlaying ? '▶ 자동 재생 중' : '⏸ 일시정지'} · {currentAgeLabel}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
