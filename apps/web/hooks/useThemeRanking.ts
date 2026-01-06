import { useState, useEffect } from 'react';
import { useRevenueRanking, RankItem } from './useRevenueRanking';
import { IndustryData } from '../mocks/industry';

export type ThemeType = 'POPULATION' | 'INDUSTRY';

export type ThemeValue = string;

export interface ThemeRankingItem extends RankItem {
  // Add any theme-specific extra fields if needed,
  // but RankItem covers basic needs (name, amount/count, changeType).
  // For Population, 'amount' will represent Population Count.
}

export type AdminLevel = 'gu' | 'dong' | 'commercial';

interface UseThemeRankingProps {
  themeType: ThemeType;
  themeValue: string; // Generic string to accommodate various codes
  ageGroup?: string;
  timeSlot?: string;
  adminLevel?: AdminLevel;
}

export const useThemeRanking = ({
  themeType,
  themeValue,
  ageGroup,
  timeSlot,
  adminLevel = 'commercial',
}: UseThemeRankingProps) => {
  const [popItems, setPopItems] = useState<RankItem[]>([]);
  const [popLoading, setPopLoading] = useState(false);

  // Real Data for Industry
  const mappedCode = getIndustryCode(themeValue) || themeValue;

  // Check if mapped code is a Main Category (e.g. I2 for Food) -> Expand to children codes
  const category = IndustryData.find((c) => c.code === mappedCode);
  const derivedIndustryCodes = category
    ? category.children?.map((c) => c.code).join(',')
    : undefined;

  const {
    items: realItems,
    isLoading: isRealLoading,
    handleSelect: handleRealSelect,
  } = useRevenueRanking({
    level: adminLevel,
    industryCode:
      themeType === 'INDUSTRY' && !category ? mappedCode : undefined,
    industryCodes:
      themeType === 'INDUSTRY' && category ? derivedIndustryCodes : undefined,
  });

  // Real Data for Population (Replaces Mock)
  useEffect(() => {
    if (themeType === 'POPULATION') {
      setPopLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const url = new URL(`${baseUrl}/floating-population/ranking`);

      // Pass adminLevel to API
      url.searchParams.set('level', adminLevel);

      // Default to 'total' if undefined, or handle 'total' string
      if (ageGroup && ageGroup !== 'total')
        url.searchParams.set('ageGroup', ageGroup);
      if (timeSlot && timeSlot !== 'total')
        url.searchParams.set('timeSlot', timeSlot);

      fetch(url.toString())
        .then((res) => res.json())
        .then((data) => {
          setPopItems(data.items || []);
        })
        .catch((err) => {
          console.error('Failed to fetch population ranking', err);
          setPopItems([]);
        })
        .finally(() => {
          setPopLoading(false);
        });
    }
  }, [themeType, ageGroup, timeSlot, adminLevel]);

  const items = themeType === 'INDUSTRY' ? realItems : popItems;
  const isLoading = themeType === 'INDUSTRY' ? isRealLoading : popLoading;

  return { items, isLoading, handleSelect: handleRealSelect };
};

// Map UI Theme to Industry Code
function getIndustryCode(theme: string): string | undefined {
  const map: Record<string, string> = {
    FOOD: 'I2',
    CAFE: 'CS100010',
    ALCOHOL: 'CS100009',
    RETAIL: 'G2',
  };
  return map[theme] || undefined;
}
