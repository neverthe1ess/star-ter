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
  summary: string; // AI Summary comment
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

// Unified Chart Mock Data
export const METRIC_DATA = {
  sectors: [
    { name: '카페', value: 85, color: '#3b82f6' },
    { name: '한식', value: 72, color: '#60a5fa' },
    { name: '주점', value: 65, color: '#93c5fd' },
    { name: '양식', value: 45, color: '#bfdbfe' },
    { name: '편의점', value: 30, color: '#dbeafe' },
  ],
  saturation: [
    { name: '카페 (위험)', value: 95, color: '#ef4444' },
    { name: '편의점 (주의)', value: 75, color: '#f59e0b' },
    { name: '한식 (보통)', value: 50, color: '#3b82f6' },
    { name: '헬스장 (여유)', value: 20, color: '#10b981' },
  ],
  growth: [
    { name: '1월', value: 4200 },
    { name: '2월', value: 4500 },
    { name: '3월', value: 4300 },
    { name: '4월', value: 4800 },
    { name: '5월', value: 5100 },
    { name: '6월', value: 5400 },
  ],
  demographics: [
    { name: '20대', value: 45, color: '#3b82f6' },
    { name: '30대', value: 30, color: '#60a5fa' },
    { name: '40대', value: 15, color: '#93c5fd' },
    { name: '50대+', value: 10, color: '#bfdbfe' },
  ],
  population: [
    { name: '09시', value: 1200 },
    { name: '12시', value: 3800 },
    { name: '15시', value: 2500 },
    { name: '18시', value: 4500 },
    { name: '21시', value: 3200 },
    { name: '24시', value: 1500 },
  ],
  radar: [
    { subject: '10대', male: 40, female: 60, fullMark: 100 },
    { subject: '20대', male: 80, female: 90, fullMark: 100 },
    { subject: '30대', male: 70, female: 85, fullMark: 100 },
    { subject: '40대', male: 50, female: 50, fullMark: 100 },
    { subject: '50대+', male: 30, female: 40, fullMark: 100 },
  ],
};

export const METRIC_INSIGHTS = {
  '잘나가는 업종': {
    highlight: '카페',
    val: '85',
    text: '업종이 압도적인 매출 1위를 기록하고 있어요.',
  },
  '업종 포화도': {
    highlight: '카페',
    val: '위험',
    text: '업종은 이미 포화 상태라 진입에 주의가 필요해요.',
  },
  '매출 성장성': {
    highlight: '12%',
    val: '상승',
    text: '지난달보다 매출이 크게 올라 성장세가 뚜렷해요.',
  },
  '성별/연령': {
    highlight: '20대',
    val: '45%',
    text: '고객 비중이 가장 높아 젊은 층 타겟팅이 유리해요.',
  },
  유동인구: {
    highlight: '18시',
    val: '4,500명',
    text: '퇴근 시간대에 유동인구가 가장 붐비는 상권이에요.',
  },
};

export const RANKING_DATA: RankingItem[] = [
  {
    id: '1',
    rank: 1,
    name: '강남역 핵심상권',
    category: '종합',
    revenue: 139600000,
    fluctuation: 8.63,
    volume: 790000,
    stores: 450,
    isFavorite: true,
    code: 'gangnam',
    summary:
      '대한민국 최대 유동인구를 자랑하며 2030 직장인과 학생의 유입이 끊이지 않는 곳입니다. 높은 임대료에도 불구하고 브랜드 플래그십 스토어의 성지입니다.',
  },
  {
    id: '2',
    rank: 2,
    name: '성수동 카페거리',
    category: '식음료',
    revenue: 88000000,
    fluctuation: 12.4,
    volume: 450000,
    stores: 230,
    isFavorite: true,
    code: 'seongsu',
    summary:
      '폐공장을 활용한 힙한 카페와 팝업 스토어가 즐비해 MZ세대의 성지로 불립니다. 평일 점심 직장인 수요와 주말 데이트 수요가 모두 탄탄합니다.',
  },
  {
    id: '3',
    rank: 3,
    name: '홍대 입구',
    category: '유흥/식음',
    revenue: 95000000,
    fluctuation: -0.42,
    volume: 850000,
    stores: 600,
    isFavorite: false,
    code: 'hongdae',
    summary:
      '20대 유동인구가 가장 많으며 버스킹 문화와 클럽이 발달했습니다. 최근 연남동으로 상권이 확장되는 추세입니다.',
  },
  {
    id: '4',
    rank: 4,
    name: '압구정 로데오',
    category: '패션/뷰티',
    revenue: 120000000,
    fluctuation: 11.7,
    volume: 320000,
    stores: 180,
    isFavorite: false,
    code: 'apgujeong',
    summary:
      '명품 브랜드와 성형외과가 밀집된 고급 상권입니다. MZ세대를 겨냥한 힙한 카페와 다이닝이 늘어나며 제2의 전성기를 맞았습니다.',
  },
  {
    id: '5',
    rank: 5,
    name: '여의도 금융가',
    category: '오피스',
    revenue: 110000000,
    fluctuation: 19.86,
    volume: 550000,
    stores: 310,
    isFavorite: true,
    code: 'yeouido',
    summary:
      '더현대 서울 오픈 이후 주말 유동인구가 폭발적으로 증가했습니다. 평일은 금융가 직장인, 주말은 쇼핑객으로 붐빕니다.',
  },
  {
    id: '6',
    rank: 6,
    name: '이태원',
    category: '유흥',
    revenue: 71513000,
    fluctuation: 4.97,
    volume: 280000,
    stores: 250,
    isFavorite: false,
    code: 'itaewon',
    summary:
      '외국인 관광객과 주말 나들이객이 주를 이룹니다. 다양한 국가의 음식점과 바가 있어 이국적인 분위기를 냅니다.',
  },
  {
    id: '7',
    rank: 7,
    name: '잠실 송리단길',
    category: '식음료',
    revenue: 56880000,
    fluctuation: 2.86,
    volume: 410000,
    stores: 190,
    isFavorite: false,
    code: 'jamsil',
    summary:
      '석촌호수와 롯데월드몰의 시너지 효과가 큽니다. 송리단길 카페거리와 방이동 먹자골목이 핵심입니다.',
  },
  {
    id: '8',
    rank: 8,
    name: '북촌 한옥마을',
    category: '관광',
    revenue: 37830000,
    fluctuation: 25.4,
    volume: 150000,
    stores: 120,
    isFavorite: true,
    code: 'bukchon',
    summary:
      '전통과 현대가 공존하는 관광 상권입니다. 한복 대여점과 카페가 많으며 외국인 관광객 비율이 매우 높습니다.',
  },
  {
    id: '9',
    rank: 9,
    name: '판교 테크노밸리',
    category: '오피스',
    revenue: 98000000,
    fluctuation: 16.88,
    volume: 480000,
    stores: 290,
    isFavorite: false,
    code: 'pangyo',
    summary:
      'IT 기업이 밀집된 한국의 실리콘밸리입니다. 구매력 높은 직장인이 많아 평일 점심 및 저녁 회식 상권이 발달했습니다.',
  },
  {
    id: '10',
    rank: 10,
    name: '한남동',
    category: '고급주거',
    revenue: 65000000,
    fluctuation: 30.69,
    volume: 120000,
    stores: 150,
    isFavorite: true,
    code: 'hannam',
    summary:
      '고급 주거지와 인접하여 객단가가 높은 하이엔드 상권입니다. 갤러리, 편집샵, 고급 레스토랑이 주를 이룹니다.',
  },
];

export const CHART_DATA = [
  { time: '15:00', value: 1850 },
  { time: '15:30', value: 1880 },
  { time: '16:00', value: 1820 },
  { time: '16:30', value: 1840 },
  { time: '17:00', value: 1900 },
  { time: '17:30', value: 2050 },
  { time: '18:00', value: 2100 },
  { time: '18:30', value: 2080 },
  { time: '19:00', value: 2150 },
  { time: '19:30', value: 2200 },
];
