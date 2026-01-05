'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PopulationItem {
  name: string;
  value: number;
}

interface PopulationChartProps {
  data: PopulationItem[];
}

export default function PopulationChart({ data }: PopulationChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <YAxis hide />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#ef4444"
          strokeWidth={3}
          dot={{ r: 4, fill: '#ef4444' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
