'use client';

import { RegionScoreData } from './types';

interface RegionScoreSectionProps {
  score: RegionScoreData;
  userRegion: string;
}

export function RegionScoreSection({ score }: RegionScoreSectionProps) {
  const percentage = Math.round(score.score * 100);
  const { details } = score;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-slate-900">상권 테마</h4>
        <div className="text-right">
          <p className="text-xs text-slate-400">적합도</p>
          <p
            className={`text-xl font-black ${percentage >= 80 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-rose-600'}`}
          >
            {percentage}%
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-6">입지 및 상권 특성</p>

      {/* 테마 뱃지 */}
      <div className="bg-linear-to-r bg-slate-50 rounded-xl p-4 mb-4 text-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {details.theme === 'office'}
              {details.theme === 'residential'}
              {details.theme === 'commercial'}
              {details.theme === 'university'}
              {details.theme === 'station'}
              {details.theme === 'tourist'}
            </span>
            <span className="font-bold text-lg">{details.themeLabel}</span>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-2 ml-2">
          사장님이 선택한 상권 테마
        </p>
      </div>

      {/* 상세 정보 그리드 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <span>주요 연령층</span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {details.mainAgeGroup}
          </p>
          <p className="text-sm text-blue-600 font-medium">
            비중 {details.mainAgeRatio.toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <span>
              {details.theme === 'university' && '인근 대학'}
              {details.theme === 'station' && '지하철역'}
              {details.theme === 'tourist' && '유동인구'}
              {details.theme === 'commercial' && '유동인구'}
              {details.theme === 'office' && '지하철역'}
              {details.theme === 'residential' && '지하철역'}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {details.theme === 'university' &&
              `${details.nearbyUniversities}개`}
            {details.theme === 'station' && `${details.nearbySubways}개`}
            {details.theme === 'tourist' &&
              `${(details.footTraffic / 10000).toFixed(1)}만명`}
            {details.theme === 'commercial' &&
              `${(details.footTraffic / 10000).toFixed(1)}만명`}
            {details.theme === 'office' && `${details.nearbySubways}개`}
            {details.theme === 'residential' && `${details.nearbySubways}개`}
          </p>
          <p className="text-sm text-slate-400">
            {details.theme === 'university' && '도보 10분 이내'}
            {details.theme === 'station' && '도보 5분 이내'}
            {details.theme === 'tourist' && '일 평균'}
            {details.theme === 'commercial' && '일 평균'}
            {details.theme === 'office' && '도보 5분 이내'}
            {details.theme === 'residential' && '도보 5분 이내'}
          </p>
        </div>
      </div>
    </div>
  );
}
