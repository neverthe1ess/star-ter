'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface GrowthItem {
  name: string;
  value: number;
}

interface GrowthChartProps {
  data: GrowthItem[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <YAxis hide />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#8b5cf6"
          fillOpacity={1}
          fill="url(#colorGrowth)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
