'use client';

import React from 'react';
import { SummaryReportResponse } from '../../types/api-responses';

interface PaymentStatusProps {
  data: SummaryReportResponse;
}

export default function PaymentStatus({ data }: PaymentStatusProps) {
  const ages = [
    { label: '10대', value: data.ageDistribution.age10, color: 'bg-blue-400' },
    { label: '20대', value: data.ageDistribution.age20, color: 'bg-indigo-400' },
    { label: '30대', value: data.ageDistribution.age30, color: 'bg-purple-400' },
    { label: '40대', value: data.ageDistribution.age40, color: 'bg-pink-400' },
    { label: '50대 이상', value: data.ageDistribution.age50Plus, color: 'bg-rose-400' },
  ];

  return (
    <div className="px-6 py-2 pb-8">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
          연령대별 방문 분포
        </h3>

        <div className="space-y-4">
          {ages.map((age) => (
            <div key={age.label} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-gray-500">
                <span>{age.label}</span>
                <span className="text-gray-900">{age.value.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${age.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${age.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-50">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="font-bold text-indigo-600">Tip:</span> 이 지역은 {data.keyMetrics.coreCustomer.ageGroup} 고객층이 가장 활발하게 활동하고 있습니다. 해당 연령대를 타겟으로 한 마케팅이 효과적일 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
