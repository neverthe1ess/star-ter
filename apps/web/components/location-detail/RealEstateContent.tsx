
export function RealEstateContent() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">부동산 정보</h2>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 보증금</p>
              <p className="text-2xl font-bold text-gray-900">5,000만원</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 월세</p>
              <p className="text-2xl font-bold text-gray-900">280만원</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 권리금</p>
              <p className="text-2xl font-bold text-gray-900">3,500만원</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 평수</p>
              <p className="text-2xl font-bold text-gray-900">25평</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">인근 매물 정보</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      상가 {i}층
                    </span>
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">
                      계약가능
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>보증금 5,000만원 / 월세 300만원</p>
                    <p>면적 30평 · 권리금 4,000만원</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
