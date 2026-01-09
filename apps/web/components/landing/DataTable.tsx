'use client';

import { ChevronRight } from 'lucide-react';

import {
  growthData,
  mzPreferenceData,
  populationData,
  revenueData,
  type AreaRanking,
} from './mock/landing-mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

function RankingTable({ data }: { data: AreaRanking[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-600 border-b">
            <th className="pb-3 font-normal">순위/상권명</th>
            <th className="pb-3 font-normal text-right">평균매출 (분기)</th>
            <th className="pb-3 font-normal text-right">등락률</th>
          </tr>
        </thead>
        <tbody>
          {data.map((area) => (
            <tr key={area.rank} className="border-b hover:bg-gray-50">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-4">{area.rank}</span>
                  <div>
                    <div className="font-medium text-gray-900">{area.name}</div>
                    <div className="text-sm text-gray-500">{area.category}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 text-right font-medium">{area.score}</td>
              <td
                className={`py-4 text-right font-medium ${
                  area.growth.startsWith('▲') || area.growth === 'HOT'
                    ? 'text-red-600'
                    : 'text-blue-800'
                }`}
              >
                {area.growth}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataTable() {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="revenue" className="px-6">
                  평균매출
                </TabsTrigger>
                <TabsTrigger value="growth" className="px-6">
                  성장상권
                </TabsTrigger>
                <TabsTrigger value="population" className="px-6">
                  유동인구
                </TabsTrigger>
                <TabsTrigger value="mz" className="px-6">
                  MZ 선호도
                </TabsTrigger>
              </TabsList>

              <TabsContent value="revenue">
                <RankingTable data={revenueData} />
              </TabsContent>
              <TabsContent value="growth">
                <RankingTable data={growthData} />
              </TabsContent>
              <TabsContent value="population">
                <RankingTable data={populationData} />
              </TabsContent>
              <TabsContent value="mz">
                <RankingTable data={mzPreferenceData} />
              </TabsContent>
            </Tabs>
          </div>

          {/* TODO: 집어넣을 데이터 생각해야해 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">공지사항</h3>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <div className="text-sm text-gray-900 group-hover:text-blue-800 mb-1">
                  신규 상권 데이터 업데이트 안내
                </div>
                <div className="text-xs text-gray-500">2026.01.08</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-sm text-gray-900 group-hover:text-blue-800 mb-1">
                  2024년 4분기 상권 트렌드 리포트 발행
                </div>
                <div className="text-xs text-gray-500">2026.01.08</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-sm text-gray-900 group-hover:text-blue-800 mb-1">
                  서비스 이용약관 개정 안내
                </div>
                <div className="text-xs text-gray-500">2026.01.08</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
