'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

interface SectorItem {
  name: string;
  value: number;
  color: string;
}

interface SectorChartProps {
  data: SectorItem[];
}

export default function SectorChart({ data }: SectorChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#D9515E" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 16, fontWeight: 500, fill: '#111827' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis type="number" hide domain={[0, 100]} />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? 'url(#redGradient)' : 'url(#barGradient)'}
            />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            style={{ fontSize: '13px', fontWeight: 'bold', fill: '#4b5563' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
