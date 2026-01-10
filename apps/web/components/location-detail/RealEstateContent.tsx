import type { RealEstateItem } from './types';

/**
 * 【RealEstateContent 컴포넌트】
 * 
 * 📚 핵심 개념: Props를 통한 데이터 전달
 * - 부모 컴포넌트(LocationDetailPage)에서 `items` 배열을 props로 받음
 * - 서버에서 이미 데이터를 가져왔으므로, 여기서는 "표시"만 담당
 * 
 * 📚 핵심 개념: map() 함수로 배열을 UI로 변환
 * - items.map()을 사용해 각 매물 데이터를 카드 UI로 변환
 * - key prop: React가 각 요소를 구분하기 위해 필수
 * 
 * 📚 핵심 개념: Nullish Coalescing (??)
 * - API 데이터가 null일 수 있으므로 기본값 제공
 * - 예: item.deposit ?? 0 → deposit이 null이면 0 사용
 */

interface RealEstateContentProps {
  items: RealEstateItem[];
}

/**
 * 천원 단위를 만원 단위로 변환하고 포맷팅
 * 예: 50000 (천원) → "5,000" (만원)
 * 
 * 【숫자 포맷팅 개념】
 * - toLocaleString(): 천 단위마다 콤마 추가 (국제화 지원)
 * - Math.round(): 소수점 반올림
 */
function formatToManWon(cheonWon: number | null): string {
  if (cheonWon === null || cheonWon === 0) return '-';
  // 천원 → 만원 변환 (÷ 10) -> 반올림
  const manWon = (cheonWon / 10).toFixed(0);
  return manWon.toLocaleString();
}

/**
 * m²를 평으로 변환하고 포맷팅
 * 1평 = 3.3058 m²
 */
function formatToPyeong(sizeM2: number | null): string {
  if (sizeM2 === null || sizeM2 === 0) return '-';
  const pyeong = sizeM2 / 3.3058;
  return pyeong.toFixed(1); // 소수점 1자리까지
}

/**
 * 층수 표시 포맷팅
 * 예: floor=2, groundfloor=5 → "2층/5층"
 */
/**
 * 【개념 설명: 음수 처리 및 절대값 활용】
 * 1. 조건부 연산: floor가 0보다 작으면 지하층으로 판단합니다.
 * 2. Math.abs(): 음수(-1)를 양수(1)로 바꿔서 "지하 1층"으로 출력하게 돕습니다.
 * 3. 템플릿 리터럴: `${}` 문법으로 변수를 문자열 안에 삽입합니다.
 */
function formatFloor(floor: number | null, groundfloor: number | null): string {
  if (floor === null) return '-';

  // 층수 정보를 텍스트로 변환 (음수일 경우 '지하' 접두사 추가)
  const floorLabel: string = floor < 0 ? `지하 ${Math.abs(floor)}층` : `${floor}층`;

  // 전체 층수 정보(groundfloor)가 있으면 "현재층/전체층" 형태로 표시
  if (groundfloor !== null) {
    return `${floorLabel}/${groundfloor}층`;
  }
  
  return floorLabel;
}

export function RealEstateContent({ items }: RealEstateContentProps) {
  // 【조건부 렌더링 개념】
  // 데이터가 비어있을 때 사용자에게 알려주는 UI 표시
  if (!items || items.length === 0) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">부동산 정보</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">해당 상권 주변에 등록된 매물이 없습니다.</p>
            <p className="text-sm mt-2">더 넓은 지역을 검색해보세요.</p>
          </div>
        </div>
      </div>
    );
  }

  // 【통계 계산】
  // reduce()를 사용해 배열의 평균값 계산
  const avgDeposit = items.reduce((sum, item) => sum + (item.deposit ?? 0), 0) / items.length;
  const avgRent = items.reduce((sum, item) => sum + (item.monthlyrent ?? 0), 0) / items.length;
  const avgPremium = items.reduce((sum, item) => sum + (item.premium ?? 0), 0) / items.length;
  const avgSize = items.reduce((sum, item) => sum + (item.size ?? 0), 0) / items.length;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">부동산 정보</h2>
        <div className="space-y-6">
          {/* 평균 통계 카드 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 보증금</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatToManWon(avgDeposit)}만원
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 월세</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatToManWon(avgRent)}만원
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 권리금</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatToManWon(avgPremium)}만원
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 면적</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatToPyeong(avgSize)}평
              </p>
            </div>
          </div>

          {/* 매물 목록 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              인근 매물 정보 ({items.length}개)
            </h3>
            <div className="space-y-3">
              {/* 
                【map() 함수 개념】
                배열의 각 요소(item)를 JSX 요소로 변환
                - key: React가 리스트 항목을 효율적으로 관리하기 위해 필요한 고유 식별자
                - 각 item 객체의 속성을 사용해 UI 렌더링
              */}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {/* 제목 또는 이름, 없으면 주소 표시 */}
                      {item.title || item.name || item.roadaddress || '매물 정보'}
                    </span>
                    {/* 즉시 입주 가능 여부 뱃지 */}
                    <span
                      className={`text-md px-2 py-1 rounded ${
                        item.ismoveindate
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.ismoveindate ? '즉시입주' : '협의필요'}
                    </span>
                  </div>
                  
                  <div className="text-md text-gray-900 space-y-1">
                    {/* 가격 정보 */}
                    <p>
                      보증금 {formatToManWon(item.deposit)}만원 / 
                      월세 {formatToManWon(item.monthlyrent)}만원
                      {item.maintenancefee && item.maintenancefee > 0 && (
                        <span className="text-gray-900">
                          {' '}(관리비 {formatToManWon(item.maintenancefee)}만원)
                        </span>
                      )}
                    </p>
                    
                    {/* 면적 및 권리금 */}
                    <p>
                      면적 {formatToPyeong(item.size)}평 ·  
                      {" " + formatFloor(item.floor, item.groundfloor)}
                      {item.premium && item.premium > 0 && (
                        <span> · 권리금 {formatToManWon(item.premium)}만원</span>
                      )}
                    </p>
                    
                    {/* 부가 정보 */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.nearsubwaystation && (
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                          {item.nearsubwaystation}
                        </span>
                      )}
                      {item.businessmiddlecodename && (
                        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded">
                          {item.businessmiddlecodename}
                        </span>
                      )}
                    </div>
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
