
export function TrafficContent() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">유동인구 분석</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600 mb-1">평일 평균</p>
              <p className="text-3xl font-bold text-gray-900">14,200명</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">주말 평균</p>
              <p className="text-3xl font-bold text-blue-800">18,600명</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              시간대별 유동인구
            </h3>
            <div className="space-y-3">
              {['오전 (06-12시)', '오후 (12-18시)', '저녁 (18-24시)'].map(
                (time, idx) => (
                  <div key={time} className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 w-32">{time}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-800 h-3 rounded-full"
                        style={{ width: `${[60, 85, 70][idx]}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {[8520, 12070, 9930][idx]}명
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
