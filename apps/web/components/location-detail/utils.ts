/**
 * 금액 포맷팅: 천원 단위 → 만원/억 단위 표시
 * @param cheonWon - 천원 단위 금액 (예: 50000 = 5000만원)
 * @returns 포맷된 문자열 (예: "5,000만원", "1억 5,000만")
 */
export function formatToKoreaCurrency(cheonWon: number | null): string {
  if (cheonWon === null || cheonWon === 0) return '-';
  const totalManWon = Math.round(cheonWon / 10);

  // 10,000만원(1억) 이상인 경우 억 단위로 변환
  if (totalManWon >= 10000) {
    const eok = Math.floor(totalManWon / 10000);
    const rest = totalManWon % 10000;
    return rest === 0 ? `${eok}억` : `${eok}억 ${rest.toLocaleString()}만`;
  }

  // 1억 미만인 경우 만원 단위로 표시
  return totalManWon.toLocaleString() + '만';
}

/**
 * 매출액 포맷팅: 원 단위 → 만원/억 단위 표시 (소수점 포함)
 * @param amount - 원 단위 금액
 * @returns 포맷된 문자열 (예: "1.5억원", "5,000만원")
 */
export function formatRevenue(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

/**
 * 면적 포맷팅: m² → 평 변환 포함
 * 1평 = 3.3058 m²
 * @param sizeM2 - 면적 (m² 단위)
 * @returns 포맷된 문자열 (예: "100.0m² (30평)")
 */
export function formatArea(sizeM2: number | null): string {
  if (sizeM2 === null || sizeM2 === 0) return '-';
  const pyeong = sizeM2 / 3.3058;
  return `${sizeM2.toFixed(1)}m² (${pyeong.toFixed(0)}평)`;
}

/**
 * 층수 포맷팅
 * @param floor - 해당 층 (음수면 지하)
 * @param groundfloor - 건물 총 층수
 * @returns 포맷된 문자열 (예: "2층 / 5층", "지하 1층")
 */
export function formatFloor(
  floor: number | null,
  groundfloor: number | null,
): string {
  if (floor === null) return '-';

  // 층수 정보를 텍스트로 변환 (음수일 경우 '지하' 접두사 추가)
  const floorLabel = floor < 0 ? `지하 ${Math.abs(floor)}층` : `${floor}층`;

  // 전체 층수 정보가 있으면 "현재층/전체층" 형태로 표시
  if (groundfloor !== null) {
    return `${floorLabel} / ${groundfloor}층`;
  }

  return floorLabel;
}
