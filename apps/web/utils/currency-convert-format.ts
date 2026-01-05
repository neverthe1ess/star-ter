/**
 * 금액 포맷 유틸리티 함수
 * 큰 숫자를 한국어 단위(억, 만, 원)로 변환합니다.
 */

/**
 * 숫자를 한국어 금액 형식으로 변환
 * @example formatKoreanCurrency(86122222222222) => "86조 1,222억"
 * @example formatKoreanCurrency(123456789) => "1억 2,345만"
 * @example formatKoreanCurrency(12345) => "1.2만"
 * @example formatKoreanCurrency(1234) => "1,234원"
 */
export function formatKoreanCurrency(
  amount: number | bigint | null | undefined,
  options?: {
    showWon?: boolean; // '원' 표시 여부 (기본: false)
    decimals?: number; // 소수점 자릿수 (기본: 0)
  },
): string {
  if (amount === null || amount === undefined) return '0원';

  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  if (num === 0) return '0원';

  const { showWon = false } = options ?? {};

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  // 조 (1,000,000,000,000)
  const jo = Math.floor(absNum / 1_000_000_000_000);
  // 억 (100,000,000)
  const uk = Math.floor((absNum % 1_000_000_000_000) / 100_000_000);
  // 만 (10,000)
  const man = Math.floor((absNum % 100_000_000) / 10_000);
  // 원
  const won = Math.floor(absNum % 10_000);

  const parts: string[] = [];

  if (jo > 0) {
    parts.push(`${jo.toLocaleString()}조`);
  }
  if (uk > 0) {
    parts.push(`${uk.toLocaleString()}억`);
  }
  if (man > 0) {
    parts.push(`${man.toLocaleString()}만`);
  }
  if (won > 0 && parts.length === 0) {
    // 만 단위 이하일 때만 원 단위 표시
    return `${sign}${won.toLocaleString()}${showWon ? '원' : ''}`;
  }

  if (parts.length === 0) {
    return '0원';
  }

  return `${sign}${parts.join(' ')}${showWon ? '원' : ''}`;
}

/**
 * 숫자를 간단한 단위로 변환 (차트 등에서 사용)
 * @example formatShortNumber(123456789) => "1.2억"
 * @example formatShortNumber(12345678) => "1,234만"
 */
export function formatShortNumber(
  amount: number | bigint | null | undefined,
): string {
  if (amount === null || amount === undefined) return '0';

  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  if (num === 0) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000_000) {
    // 조 단위
    return `${sign}${(absNum / 1_000_000_000_000).toFixed(1)}조`;
  } else if (absNum >= 100_000_000) {
    // 억 단위
    return `${sign}${(absNum / 100_000_000).toFixed(1)}억`;
  } else if (absNum >= 10_000) {
    // 만 단위
    return `${sign}${Math.floor(absNum / 10_000).toLocaleString()}만`;
  } else {
    // 원 단위
    return `${sign}${absNum.toLocaleString()}`;
  }
}

/**
 * 숫자에 천 단위 콤마 추가
 * @example formatNumberWithComma(1234567) => "1,234,567"
 */
export function formatNumberWithComma(
  amount: number | bigint | null | undefined,
): string {
  if (amount === null || amount === undefined) return '0';

  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return num.toLocaleString('ko-KR');
}
