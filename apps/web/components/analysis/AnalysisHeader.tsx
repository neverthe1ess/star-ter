'use client';

import React from 'react';
import { Sparkles, Download } from 'lucide-react';

interface AnalysisHeaderProps {
  title?: string;
  breadcrumb?: string;
}

export default function AnalysisHeader({
  title = '상권 분석 플랫폼',
  breadcrumb = '서울시 > 강동구 > 역삼동',
}: AnalysisHeaderProps) {
  return ( 
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      {/* 좌측: 타이틀 + 브레드크럼 */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{breadcrumb}</p>
      </div>

      {/* 우측: 액션 버튼들 */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={16} />
          <span>보고서 다운로드</span>
        </button>
      </div>
    </div>
  );
}
 