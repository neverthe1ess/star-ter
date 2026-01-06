import { RankingItem } from '@/components/dashboard/mock-data';
import { fetchAiSummary, formatMetricsForAi } from '@/services/ai.service';
import { MarketAnalyticsResponse } from '@/services/revenue.service';
import { useEffect, useState } from 'react';

export const useAiSummary = (
  item: RankingItem,
  data: MarketAnalyticsResponse | null,
  isLoading: boolean,
) => {
  // AI 요약 상태
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  useEffect(() => {
    setAiSummary('');
  }, [item.code]);

  useEffect(() => {
    if (data && item && !isLoading) {
      const fetchSummary = async () => {
        setIsAiLoading(true);
        try {
          const metrics = formatMetricsForAi(
            item.name,
            data.sectors,
            data.saturation,
            data.growth,
            data.demographics,
            data.population,
          );
          const summary = await fetchAiSummary(item.name, metrics);
          setAiSummary(summary);
        } catch (err) {
          console.error('Failed to fetch AI summary', err);
        } finally {
          setIsAiLoading(false);
        }
      };

      // 디바운스: 500ms 후 요약 요청
      const timer = setTimeout(() => {
        fetchSummary();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [data, item, isLoading]);

  return { aiSummary, isAiLoading };
};
