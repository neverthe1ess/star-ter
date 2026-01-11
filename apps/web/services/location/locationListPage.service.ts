const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export interface RevenueRankingItem {
  code: string;
  name: string;
  amount: number;
  count: number;
  changeType?: string;
  fluctuationRate?: number;
}

export interface RevenueRankingResponse {
  level: string;
  items: RevenueRankingItem[];
}

// 성장률 기준 랭킹 (신흥 트렌드 상권용)
export async function getGrowthRanking(): Promise<RevenueRankingResponse> {
  const res = await fetch(`${API_URL}/revenue/ranking/growth?level=commercial`);
  if (!res.ok) {
    throw new Error('Failed to fetch growth ranking');
  }
  return res.json();
}

// 매출액 기준 랭킹 (안정형 상권용)
export async function getRevenueRanking(): Promise<RevenueRankingResponse> {
  const res = await fetch(`${API_URL}/revenue/ranking?level=commercial`);
  if (!res.ok) {
    throw new Error('Failed to fetch revenue ranking');
  }
  return res.json();
}

// 안정형 상권 조회 (상위 20% 제외 + 결제건수 높은 상권)
export async function getStableLocations(
  limit: number = 4,
): Promise<RevenueRankingItem[]> {
  const revenueRes = await getRevenueRanking();

  // 상위 20위 제외, 결제건수 높은 순으로 정렬
  return revenueRes.items
    .slice(20, 60)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// API 데이터를 UI용 Location 형태로 변환
export interface LocationUI {
  id: string;
  name: string;
  revenue: string;
  growthRate: number;
  badge: string;
  badgeType: 'explosive' | 'rapid' | 'stable';
  rank: number;
}

export function mapRankingToLocation(
  item: RevenueRankingItem,
  index: number,
): LocationUI {
  const rate = item.fluctuationRate || 0;
  let badgeType: 'explosive' | 'rapid' | 'stable';
  let badge: string;

  if (rate >= 50) {
    badgeType = 'explosive';
    badge = '폭발 성장';
  } else if (rate >= 20) {
    badgeType = 'rapid';
    badge = '급성장';
  } else if (rate >= 0) {
    badgeType = 'stable';
    badge = '안정 성장';
  } else {
    badgeType = 'stable';
    badge = '안정';
  }

  return {
    id: item.code,
    name: item.name,
    revenue: formatRevenue(item.amount),
    growthRate: rate,
    badge,
    badgeType,
    rank: index + 1,
  };
}

// 매출액을 읽기 쉬운 형태로 변환
function formatRevenue(amount: number): string {
  if (amount >= 100000000) {
    const billions = Math.floor(amount / 100000000);
    const millions = Math.floor((amount % 100000000) / 10000);
    return `₩${billions}억 ${millions.toLocaleString()}만`;
  } else if (amount >= 10000) {
    return `₩${Math.floor(amount / 10000).toLocaleString()}만`;
  }
  return `₩${amount.toLocaleString()}`;
}
