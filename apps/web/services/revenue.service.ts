export type RevenueLevel = 'city' | 'gu' | 'dong' | 'backarea' | 'commercial';

export interface MarketAnalyticsResponse {
  sectors: { name: string; value: number }[];
  saturation: { name: string; value: number; status: string }[];
  growth: { period: string; amount: number }[];
  demographics: {
    subject: string;
    male: number;
    female: number;
    fullMark: number;
  }[];
  population: { time: string; value: number }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const fetchMarketAnalytics = async (
  level: RevenueLevel,
  code: string,
): Promise<MarketAnalyticsResponse> => {
  const response = await fetch(
    `${API_URL}/revenue/analytics?level=${level}&code=${code}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch market analytics');
  }

  return response.json();
};
