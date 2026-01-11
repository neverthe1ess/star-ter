'use client';

import { useState } from 'react';
import { Play, Pause, Clock, Users, Calendar } from 'lucide-react';
import { TIME_SLOTS, GenderFilter, AgeFilter, TimeFilter } from './types';

/**
 * 【TrafficFilterBar 컴포넌트】
 *
 * 유동인구 히트맵 필터바. 3개 시간대(새벽/낮/밤)를 지원합니다.
 */

interface TrafficFilterBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTimeIndex: number;
  onTimeChange: (index: number) => void;
  genderFilter: GenderFilter;
  ageFilter: AgeFilter;
  onFilterChange: (gender: GenderFilter, age: AgeFilter) => void;
}

export function TrafficFilterBar({
  isPlaying,
  onTogglePlay,
  currentTimeIndex,
  onTimeChange,
  genderFilter,
  ageFilter,
  onFilterChange,
}: TrafficFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentTimeLabel = TIME_SLOTS[currentTimeIndex]?.label || '낮 (8~16시)';

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
      `}</style>

      {isOpen ? (
        <div className="w-full max-w-[420px] bg-white/40 backdrop-blur-2xl rounded-[40px] p-6 shadow-2xl border border-white/40 pointer-events-auto animate-spring-up ring-1 ring-black/5">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-gray-900 font-bold text-xl leading-tight">유동인구 필터</p>
                <p className="text-blue-600 text-md font-semibold mt-0.5">
                  {currentTimeLabel} {isPlaying ? '재생 중' : '일시정지'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 hover:bg-white/60 transition-colors text-gray-600 backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 시간대 버튼 그룹 (3개) */}
          <div className="bg-white/30 rounded-3xl p-4 border border-white/50 shadow-sm mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 text-lg font-bold tracking-wide flex items-center gap-2">
                <Clock className="w-5 h-5" />
                시간대
              </span>
              <button
                onClick={onTogglePlay}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                  isPlaying
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isPlaying ? (
                  <><Pause className="w-4 h-4" /> 일시정지</>
                ) : (
                  <><Play className="w-4 h-4" /> 재생</>
                )}
              </button>
            </div>

            {/* 3개 시간대 버튼 */}
            <div className="flex gap-2">
              {TIME_SLOTS.map((slot, idx) => (
                <button
                  key={slot.filter}
                  onClick={() => onTimeChange(idx)}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                    currentTimeIndex === idx
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white/50 text-gray-600 hover:bg-white/70'
                  }`}
                >
                  {slot.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 성별 필터 */}
          <div className="bg-white/30 rounded-3xl p-4 border border-white/50 shadow-sm mb-4">
            <span className="text-gray-600 text-lg font-bold tracking-wide flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              성별
            </span>
            <div className="flex gap-2">
              {(['all', 'male', 'female'] as GenderFilter[]).map((g) => (
                <button
                  key={g}
                  onClick={() => onFilterChange(g, ageFilter)}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
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

          {/* 연령대 필터 */}
          <div className="bg-white/30 rounded-3xl p-4 border border-white/50 shadow-sm">
            <span className="text-gray-600 text-lg font-bold tracking-wide flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5" />
              연령대
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['all', 'age_10', 'age_20', 'age_30', 'age_40', 'age_50', 'age_60'] as AgeFilter[]).map((a) => (
                <button
                  key={a}
                  onClick={() => onFilterChange(genderFilter, a)}
                  className={`py-2 rounded-xl font-bold text-sm transition-all ${
                    ageFilter === a
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white/50 text-gray-600 hover:bg-white/70'
                  }`}
                >
                  {a === 'all' ? '전체' : a.replace('age_', '') + (a === 'age_60' ? '+' : '대')}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group pointer-events-auto flex items-center gap-5 bg-white/40 backdrop-blur-2xl rounded-full pl-4 pr-8 py-4 shadow-xl border border-white/40 hover:bg-white/50 transition-all duration-300 hover:scale-[1.03] active:scale-95 ring-1 ring-black/5"
        >
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300 ${isPlaying ? 'animate-pulse-play' : ''}`}>
            <Users className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-gray-900 font-bold text-xl leading-none mb-1">{currentTimeLabel}</span>
            <span className="text-blue-600 text-md font-bold">
              {isPlaying ? '▶ 유동인구 히트맵' : '⏸ 일시정지'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
