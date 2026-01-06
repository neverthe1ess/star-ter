'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RadarItem {
  subject: string;
  male: number;
  female: number;
  fullMark: number;
}

interface DemographicsRadarProps {
  data: RadarItem[];
}

export default function DemographicsRadar({ data }: DemographicsRadarProps) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius="75%" data={data} cx="50%" cy="50%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#4b5563', fontSize: 15, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="남성"
              dataKey="male"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="#3b82f6"
              fillOpacity={0.1}
            />
            <Radar
              name="여성"
              dataKey="female"
              stroke="#ec4899"
              strokeWidth={2}
              fill="#ec4899"
              fillOpacity={0.1}
            />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-600 font-medium">남성</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span className="text-sm text-gray-600 font-medium">여성</span>
        </div>
      </div>
    </div>
  );
}
