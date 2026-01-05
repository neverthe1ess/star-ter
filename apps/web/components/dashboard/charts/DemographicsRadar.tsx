'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
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
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart outerRadius={90} data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }}
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
        <Legend iconType="circle" wrapperStyle={{ marginTop: '40px' }} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
