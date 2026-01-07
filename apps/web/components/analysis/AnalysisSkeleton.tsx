import React from 'react';

export default function AnalysisSkeleton() {
  return (
    <div className="space-y-6 p-1 animate-pulse">
      {/* Header Title Skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="w-40 h-6 bg-gray-200 rounded" />
        </div>
      </div>

      {/* AI Insight Block Skeleton */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-full h-4 bg-gray-200 rounded" />
            <div className="w-3/4 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Industry Filter Buttons Skeleton */}
      <div className="flex gap-2 overflow-x-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-16 h-8 bg-gray-200 rounded-full shrink-0" />
        ))}
      </div>

      {/* Charts/Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="flex justify-between items-end">
            <div className="w-16 h-8 bg-gray-200 rounded" />
            <div className="w-16 h-8 bg-gray-200 rounded" />
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            <div className="space-y-1">
              <div className="w-16 h-3 bg-gray-200 rounded" />
              <div className="w-20 h-6 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Industries List Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
        <div className="w-48 h-5 bg-gray-200 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
