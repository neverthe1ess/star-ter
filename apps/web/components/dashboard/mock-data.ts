export interface RankingItem {
  id: string;
  rank: number;
  name: string;
  category: string;
  revenue: number; // 월 평균 매출
  fluctuation: number; // 등락률
  volume: number; // 유동인구 (or 거래량 analog)
  stores: number;
  isFavorite: boolean;
  code: string; // area code
  summary?: string; // AI Summary comment
  metricType?: 'REVENUE' | 'POPULATION'; // Display type
}

export const METRIC_TYPES = [
  '잘나가는 업종',
  '업종 포화도',
  '매출 성장성',
  '성별/연령',
  '유동인구',
] as const;
export type MetricType = (typeof METRIC_TYPES)[number];

export interface NewsItem {
  id: string;
  title: string;
  press: string;
  date: string;
  url: string;
}

export interface SnsItem {
  id: string;
  imageUrl: string;
  likes: number;
  tags: string[];
  author: string;
}

export interface BlogItem {
  id: string;
  title: string;
  snippet: string;
  author: string;
  date: string;
  thumbnailUrl?: string;
}

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: '강남역 상권, 2030 유동인구 15% 증가... 회복세',
    press: '한국경제',
    date: '2024.01.05',
    url: '#',
  },
  {
    id: '2',
    title: '성수동 팝업스토어 열풍, 임대료 상승의 주범?',
    press: '매일경제',
    date: '2024.01.03',
    url: '#',
  },
  {
    id: '3',
    title: '서울시, 골목상권 활성화에 500억 투입 결정',
    press: '서울신문',
    date: '2023.12.28',
    url: '#',
  },
  {
    id: '4',
    title: 'MZ세대가 찾는 핫플레이스, 지도로 한눈에 본다',
    press: 'IT뉴스',
    date: '2023.12.20',
    url: '#',
  },
];

export const MOCK_SNS: SnsItem[] = [
  {
    id: '1',
    imageUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop',
    likes: 1240,
    tags: ['#강남맛집', '#데이트'],
    author: 'seoul_lover',
  },
  {
    id: '2',
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
    likes: 856,
    tags: ['#성수카페', '#힙플'],
    author: 'cafe_tour',
  },
  {
    id: '3',
    imageUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop',
    likes: 2100,
    tags: ['#핫플', '#주말'],
    author: 'daily_life',
  },
  {
    id: '4',
    imageUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=400&fit=crop',
    likes: 543,
    tags: ['#맛집추천', '#서울'],
    author: 'foodie_kim',
  },
];

export const MOCK_BLOGS: BlogItem[] = [
  {
    id: '1',
    title: '강남역 데이트 코스 추천 BEST 5',
    snippet:
      '주말에 가기 좋은 강남역 맛집과 카페를 정리해봤어요. 분위기 깡패...',
    author: '여행하는 직장인',
    date: '2일 전',
  },
  {
    id: '2',
    title: '성수동 창업, 현실적인 비용 분석',
    snippet:
      '권리금부터 월세까지, 성수동에서 작은 카페를 여는데 드는 비용을...',
    author: '창업멘토 김대표',
    date: '5일 전',
  },
  {
    id: '3',
    title: '홍대 입구 숨은 맛집 리스트 공유',
    snippet: '유명한 곳 말고 진짜 현지인들만 아는 찐맛집들만 모았습니다.',
    author: '먹스타그램',
    date: '1주일 전',
  },
];
