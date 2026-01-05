'use client';

import React from 'react';

export default function PaymentStatus() {
  return (
    <div className="px-6 py-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          시간대별 결제 현황
        </h3>

        {/* 플레이스홀더 - 상세 내용은 나중에 추가 */}
        <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <span className="text-gray-400 text-sm">결제 현황 차트 영역</span>
        </div>
      </div>
    </div>
  );
}
