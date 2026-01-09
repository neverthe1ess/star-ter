export function AnalysisContent() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          업종별 매출 분석
        </h2>
        <div className="space-y-4">
          {[
            {
              name: '카페',
              revenue: '4,250만원',
              share: 35,
              color: 'bg-blue-600',
            },
            {
              name: '음식점',
              revenue: '3,890만원',
              share: 28,
              color: 'bg-indigo-600',
            },
            {
              name: '소매업',
              revenue: '2,150만원',
              share: 20,
              color: 'bg-purple-600',
            },
            {
              name: '서비스업',
              revenue: '1,870만원',
              share: 17,
              color: 'bg-pink-600',
            },
          ].map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{item.name}</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900">
                    {item.revenue}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({item.share}%)
                  </span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className={`${item.color} h-2 rounded-full`}
                  style={{ width: `${item.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
