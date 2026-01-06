import { useState, useEffect } from 'react';
import { useRevenueRanking, RankItem } from './useRevenueRanking';
import { IndustryData } from '../mocks/industry';

export type ThemeType = 'POPULATION' | 'INDUSTRY' | 'MZ' | 'GENDER' | 'GROWTH';

export type ThemeValue = string;

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

  // Fetch for POPULATION, MZ, GENDER, GROWTH themes
  useEffect(() => {
    if (themeType === 'INDUSTRY') return;

    setPopLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    let url: URL;

    if (themeType === 'POPULATION') {
      url = new URL(`${baseUrl}/floating-population/ranking`);
      url.searchParams.set('level', adminLevel);
      if (ageGroup && ageGroup !== 'total')
        url.searchParams.set('ageGroup', ageGroup);
      if (timeSlot && timeSlot !== 'total')
        url.searchParams.set('timeSlot', timeSlot);
    } else if (themeType === 'MZ') {
      url = new URL(`${baseUrl}/floating-population/ranking/mz`);
      url.searchParams.set('level', adminLevel);
    } else if (themeType === 'GENDER') {
      url = new URL(`${baseUrl}/floating-population/ranking/gender`);
      url.searchParams.set('level', adminLevel);
      url.searchParams.set('gender', themeValue === 'male' ? 'male' : 'female');
    } else if (themeType === 'GROWTH') {
      url = new URL(`${baseUrl}/revenue/ranking/growth`);
      url.searchParams.set('level', adminLevel);
    } else {
      setPopLoading(false);
      return;
    }

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        setPopItems(data.items || []);
      })
      .catch((err) => {
        console.error('Failed to fetch ranking', err);
        setPopItems([]);
      })
      .finally(() => {
        setPopLoading(false);
      });
  }, [themeType, themeValue, ageGroup, timeSlot, adminLevel]);

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
