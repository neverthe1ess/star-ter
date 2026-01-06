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
