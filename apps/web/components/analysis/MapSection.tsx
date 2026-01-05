'use client';

import React from 'react';
import AnalysisMap from './AnalysisMap';

export default function MapSection() {
  return (
    <div className="relative h-full flex flex-col p-6 bg-white">
      <div className="relative flex-1 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-inner">
        <div className="absolute inset-0 z-0">
          <AnalysisMap />
        </div>
      </div>
    </div>
  );
}
