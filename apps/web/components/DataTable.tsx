import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ChevronRight } from "lucide-react";

interface AreaRanking {
  rank: number;
  name: string;
  category: string;
  score: number | string;
  growth: string;
  traffic: string;
}

const volumeData: AreaRanking[] = [
  { rank: 1, name: "강남역", category: "유흥/음식", score: 5.39, growth: "+35.09%", traffic: "14,338M" },
  { rank: 2, name: "홍대입구", category: "쇼핑/음식", score: 3.053, growth: "-3.08%", traffic: "12,158M" },
  { rank: 3, name: "명동", category: "관광/쇼핑", score: "4,522.000", growth: "-1.95%", traffic: "5,970M" },
  { rank: 4, name: "이태원", category: "음식/문화", score: 1.463, growth: "+0.48%", traffic: "5,500M" },
  { rank: 5, name: "성수동", category: "카페/문화", score: 38.4, growth: "+17.79%", traffic: "4,547M" },
  { rank: 6, name: "여의도", category: "업무/금융", score: 186, growth: "+37.78%", traffic: "4,461M" },
];

export function DataTable() {
  return (
    <section className="py-16 px-6 bg-white border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            <Tabs defaultValue="volume" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="volume" className="px-6">
                  매출액
                </TabsTrigger>
                <TabsTrigger value="marketcap" className="px-6">
                  유동인구
                </TabsTrigger>
                <TabsTrigger value="gainers" className="px-6">
                  1시간 급상승
                </TabsTrigger>
                <TabsTrigger value="losers" className="px-6">
                  1시간 급하락
                </TabsTrigger>
              </TabsList>

              <TabsContent value="volume">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600 border-b">
                        <th className="pb-3 font-normal">순위/상권명</th>
                        <th className="pb-3 font-normal text-right">점수</th>
                        <th className="pb-3 font-normal text-right">변화율(1D)</th>
                        <th className="pb-3 font-normal text-right">유동인구(1h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volumeData.map((area) => (
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
                              area.growth.startsWith("+") ? "text-red-600" : "text-blue-800"
                            }`}
                          >
                            {area.growth}
                          </td>
                          <td className="py-4 text-right text-gray-600">{area.traffic}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>

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
