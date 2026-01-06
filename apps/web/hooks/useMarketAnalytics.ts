import { useState, useEffect } from 'react';
import {
  fetchMarketAnalytics,
  MarketAnalyticsResponse,
  RevenueLevel,
} from '@/services/revenue.service';

/**
 * Custom Hook to fetch market analytics data.
 *
 * TODO: For better performance (caching, deduplication) and features (auto-refetch),
 * migrate this to TanStack Query (React Query) in the future.
 * Example:
 * const { data } = useQuery({ queryKey: ['market', level, code], queryFn: ... })
 */
export const useMarketAnalytics = (
  level: RevenueLevel | null,
  code: string | null,
) => {
  const [data, setData] = useState<MarketAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when params change or are invalid
    if (!level || !code) {
      setData(null);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchMarketAnalytics(level, code);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [level, code]);

  return { data, isLoading, error };
};
