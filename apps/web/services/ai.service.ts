import { MarketAnalyticsResponse } from './revenue.service';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const fetchAiSummary = async (areaName: string, metrics: string) => {
  const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'revenue', // Default topic for general summary
      areaName,
      metrics,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch AI summary');
  }

  return response.text();
};

export const formatMetricsForAi = (
  areaName: string,
  sectors: MarketAnalyticsResponse['sectors'],
  saturation: MarketAnalyticsResponse['saturation'],
  growth: MarketAnalyticsResponse['growth'],
  demographics: MarketAnalyticsResponse['demographics'],
  population: MarketAnalyticsResponse['population'],
) => {
  const demoTotal = demographics?.reduce(
    (sum, d) => sum + (Number(d.male) || 0) + (Number(d.female) || 0),
    0,
  );

  return `
    상권명: ${areaName}

    1. 주요 업종 (매출 상위):
    ${sectors?.map((s) => `- ${s.name}: ${s.value}`).join('\n') || '데이터 없음'}

    2. 업종 포화도:
    ${saturation?.map((s) => `- ${s.name}: ${s.value}`).join('\n') || '데이터 없음'}

    3. 매출 추이:
    ${growth?.map((g) => `- ${g.period}: ${g.amount}`).join('\n') || '데이터 없음'}

    4. 성별/연령 분포 (전체 대비 비중):
    ${
      demographics
        ?.map((d) => {
          const male = Number(d.male) || 0;
          const female = Number(d.female) || 0;
          const malePct =
            demoTotal > 0 ? ((male / demoTotal) * 100).toFixed(1) : 0;
          const femalePct =
            demoTotal > 0 ? ((female / demoTotal) * 100).toFixed(1) : 0;
          return `- ${d.subject}: 남 ${malePct}%, 여 ${femalePct}%`;
        })
        .join('\n') || '데이터 없음'
    }

    5. 시간대별 유동인구:
    ${population?.map((p) => `- ${p.time}시: ${p.value}명`).join('\n') || '데이터 없음'}
  `;
};

// 부동산 매물 AI 요약 API 호출
export const fetchRealEstateAiSummary = async (metrics: string) => {
  const response = await fetch(`${API_BASE_URL}/ai/real-estate-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ metrics }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch real estate AI summary');
  }

  return response.text();
};

// 부동산 매물 데이터를 AI용 텍스트로 포맷팅
interface RealEstateMetrics {
  deposit: number | null;
  monthlyrent: number | null;
  premium: number | null;
  size: number | null;
  floor: number | null;
}

export const formatRealEstateMetrics = (items: RealEstateMetrics[]) => {
  if (!items || items.length === 0) {
    return '매물 데이터가 없습니다.';
  }

  const validItems = items.filter(
    (item) => item.deposit !== null || item.monthlyrent !== null,
  );

  if (validItems.length === 0) {
    return '유효한 매물 데이터가 없습니다.';
  }

  const avg = (arr: (number | null)[]): number => {
    const valid = arr.filter((v): v is number => v !== null && v > 0);
    return valid.length > 0
      ? valid.reduce((a, b) => a + b, 0) / valid.length
      : 0;
  };

  // 만원 → 억/만원 포맷팅 (10000만원 이상이면 억 단위로)
  const formatPrice = (value: number): string => {
    if (value >= 10000) {
      const billion = Math.floor(value / 10000);
      const remainder = value % 10000;
      if (remainder === 0) {
        return `${billion}억`;
      }
      return `${billion}억 ${Math.round(remainder).toLocaleString()}만`;
    }
    return `${Math.round(value).toLocaleString()}만`;
  };

  const avgDeposit = avg(validItems.map((i) => i.deposit));
  const avgMonthlyRent = avg(validItems.map((i) => i.monthlyrent));
  const avgPremium = avg(validItems.map((i) => i.premium));
  const avgSize = avg(validItems.map((i) => i.size));
  const avgFloor = avg(validItems.map((i) => i.floor));

  const sizes = validItems
    .map((i) => i.size)
    .filter((s): s is number => s !== null && s > 0);
  const smallCount = sizes.filter((s) => s < 20).length;
  const mediumCount = sizes.filter((s) => s >= 20 && s < 50).length;
  const largeCount = sizes.filter((s) => s >= 50).length;

  const floors = validItems
    .map((i) => i.floor)
    .filter((f): f is number => f !== null);
  const basementCount = floors.filter((f) => f < 0).length;
  const groundFloorCount = floors.filter((f) => f === 1).length;
  const upperFloorCount = floors.filter((f) => f > 1).length;

  return `
총 매물 수: ${validItems.length}건

1. 평균 가격 정보:
- 평균 보증금: ${avgDeposit > 0 ? `${formatPrice(avgDeposit / 10)}원` : '정보 없음'}
- 평균 월세: ${avgMonthlyRent > 0 ? `${formatPrice(avgMonthlyRent / 10)}원` : '정보 없음'}
- 평균 권리금: ${avgPremium > 0 ? `${formatPrice(avgPremium / 10)}원` : '정보 없음'}

2. 면적 정보:
- 평균 면적: ${avgSize > 0 ? `${avgSize.toFixed(1)}㎡ (약 ${(avgSize / 3.3).toFixed(1)}평)` : '정보 없음'}
- 소형(20㎡ 미만): ${smallCount}건
- 중형(20~50㎡): ${mediumCount}건
- 대형(50㎡ 이상): ${largeCount}건

3. 층수 분포:
- 지하층: ${basementCount}건
- 1층: ${groundFloorCount}건
- 2층 이상: ${upperFloorCount}건
- 평균 층수: ${avgFloor !== 0 ? `${avgFloor.toFixed(1)}층` : '정보 없음'}
  `;
};
