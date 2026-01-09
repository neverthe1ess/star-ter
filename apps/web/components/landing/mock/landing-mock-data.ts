export interface AreaRanking {
  rank: number;
  name: string;
  category: string;
  score: string | number;
  growth: string;
}

export const revenueData: AreaRanking[] = [
  {
    rank: 1,
    name: '한강로동',
    category: '정체 상권',
    score: '약 5,969억원',
    growth: '▲ 1.4%',
  },
  {
    rank: 2,
    name: '한남동',
    category: '변동 상권',
    score: '약 1,267억원',
    growth: '▲ 2.5%',
  },
  {
    rank: 3,
    name: '이태원 1동',
    category: '정체 상권',
    score: '약 912억원',
    growth: '▲ 2.9%',
  },
  {
    rank: 4,
    name: '용문동',
    category: '정체 상권',
    score: '약 756억원',
    growth: '▼ 1.7%',
  },
  {
    rank: 5,
    name: '후암동',
    category: '뜨는 상권',
    score: '약 645억원',
    growth: '▼ 2.8%',
  },
];

export const growthData: AreaRanking[] = [
  {
    rank: 1,
    name: 'team204(팀204)',
    category: '정체 상권',
    score: '약 316.0억원',
    growth: '▲ 2623.5%',
  },
  {
    rank: 2,
    name: '배꽃어린이공원',
    category: '위험 상권',
    score: '약 6.5억원',
    growth: '▲ 999.5%',
  },
  {
    rank: 3,
    name: '길상사',
    category: '정체 상권',
    score: '약 8.6억원',
    growth: '▲ 694.8%',
  },
  {
    rank: 4,
    name: '당산역 13번',
    category: '정체 상권',
    score: '약 9.3억원',
    growth: '▲ 680.4%',
  },
  {
    rank: 5,
    name: '황학동벼룩시장',
    category: '정체 상권',
    score: '약 30.3억원',
    growth: '▲ 648.3%',
  },
];

export const populationData: AreaRanking[] = [
  {
    rank: 1,
    name: '종로·청계 관광특구',
    category: '정체 상권',
    score: '약 8,416,294명',
    growth: '▼ 1.4%',
  },
  {
    rank: 2,
    name: '강남역',
    category: '변동 상권',
    score: '약 8,156,878명',
    growth: '▲ 5.8%',
  },
  {
    rank: 3,
    name: '명동 남대문 북창동 다동 무교동 관광특구',
    category: '정체 상권',
    score: '약 7,036,792명',
    growth: '▲ 1.2%',
  },
  {
    rank: 4,
    name: '충정로역 7번',
    category: '정체 상권',
    score: '약 6,452,339명',
    growth: '▲ 5.6%',
  },
  {
    rank: 5,
    name: '신촌역(신촌역, 신촌로터리)',
    category: '변동 상권',
    score: '약 5,993,241명',
    growth: '▼ 4.0%',
  },
];

export const mzPreferenceData: AreaRanking[] = [
  {
    rank: 1,
    name: '홍대소상공인상점가',
    category: '변동 상권',
    score: '약 388,262명',
    growth: '▲ 79.2%',
  },
  {
    rank: 2,
    name: '서교시장',
    category: '변동 상권',
    score: '약 55,855명',
    growth: '▲ 78.5%',
  },
  {
    rank: 3,
    name: '홍대입구역(홍대)',
    category: '변동 상권',
    score: '약 3,082,386명',
    growth: '▲ 75.8%',
  },
  {
    rank: 4,
    name: '경희대후문',
    category: '뜨는 상권',
    score: '약 981,240명',
    growth: '▲ 75.3%',
  },
  {
    rank: 5,
    name: '어린이대공원역 4번',
    category: '변동 상권',
    score: '약 251,961명',
    growth: '▲ 78.5%',
  },
];
