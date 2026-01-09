import type { ReactNode } from 'react';
import { Wallet, Maximize2, Coins, TrendingUp } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RealEstateGrid {
  label: string;
  value: string;
  icon: ReactNode;
}

export interface RealEstateListing {
  name: string;
  status: string;
  price: string;
  details: string;
}

export interface Feature {
  id: string;
  type: 'standard' | 'chat' | 'real-estate';
  label: string;
  title: string;
  description: ReactNode;
  metricTitle: string;
  metricValue: string;
  score: number;
  scoreTitle: string;
  scoreDesc: string;
  chatMessages?: ChatMessage[];
  realEstateInfo?: {
    grids: RealEstateGrid[];
    listings: RealEstateListing[];
  };
  stats: {
    label: string;
    value: string;
    sub: string;
    color?: string;
  }[];
}

export const FEATURES: Feature[] = [
  {
    id: 'bigdata',
    type: 'standard',
    label: '빅데이터 상권',
    title: '정교한 상권 데이터 분석',
    description: (
      <>
        안정적인 정보제공을 위해 Starter는 공공데이터를 이용합니다.
        <br />
        단순한 정보 제공을 넘어, AI가 당신의 성공 가능성을 수치로 보여줍니다.
      </>
    ),
    metricTitle: '예상 월평균 매출액',
    metricValue: '3,450만 원',
    score: 98,
    scoreTitle: '이곳은 사장님에게 최고의 선택지입니다.',
    scoreDesc:
      '자본금 7천만원 규모와 MZ세대 타겟팅을 고려했을 때, 인근 경쟁 업종 대비 희소성이 높고 주중/주말 유동인구 밸런스가 매우 뛰어납니다.',
    stats: [
      { label: '평균 유동인구', value: '15,840명', sub: '일평균' },
      {
        label: '경쟁 업체 수',
        value: '12개',
        sub: '적정 수준',
        color: 'text-green-600',
      },
      { label: '평균 임대료', value: '280만원', sub: '월평균' },
    ],
  },
  {
    id: 'ai',
    type: 'chat',
    label: 'AI 예측',
    title: '미래 가치까지 예측하는 AI',
    description: (
      <>
        과거 데이터를 바탕으로 미래를 데이터를 예측합니다
        <br />
        Starter의 알고리즘이 향후 상권 성장성을 예측해드립니다.
      </>
    ),
    metricTitle: '예상 수익률 (ROAS)',
    metricValue: '32.5%',
    score: 92,
    scoreTitle: '안정적인 수익 창출이 기대됩니다.',
    scoreDesc:
      '초기 투자금 회수 기간이 평균 14개월로 예상되며, 주변 상권의 성장세와 맞물려 지속적인 매출 상승이 예측되는 지역입니다.',
    chatMessages: [
      {
        role: 'user',
        content: '여기서 카페 창업하면 월 매출 얼마나 나올까?',
      },
      {
        role: 'assistant',
        content:
          '이 지역 20평 기준 예상 월 매출은 4,200만원입니다. 주말 매출 비중이 60%로 높게 예측됩니다.',
      },
      {
        role: 'user',
        content: '성공 확률은 얼마나 돼?',
      },
      {
        role: 'assistant',
        content:
          '비슷한 규모의 카페 대비 상위 15% 이내의 성과가 기대되며, 생존율은 92%로 매우 안정적입니다.',
      },
    ],
    stats: [
      {
        label: '폐업률',
        value: '2.1%',
        sub: '매우 낮음',
        color: 'text-green-600',
      },
      {
        label: '매출 성장률',
        value: '+15.4%',
        sub: '연평균',
        color: 'text-red-600',
      },
      { label: '재방문율', value: '68%', sub: '타겟 고객' },
    ],
  },
  {
    id: 'recommend',
    type: 'real-estate',
    label: '상가 추천',
    title: '업종에 딱 맞는 상가 찾기',
    description: (
      <>
        데이터를 바탕으로 조건에 맞는 알맞은 매물을 찾아냅니다.
        <br />
        권리금 분석부터 임대료까지, 부동산 정보들을 제공합니다.
      </>
    ),
    metricTitle: '매물 매칭 점수',
    metricValue: '98%',
    score: 95,
    scoreTitle: '성수동 카페거리 1층 20평',
    scoreDesc:
      '유동인구가 가장 많은 메인 거리 이면에 위치하여 임대료는 30% 저렴하면서도, 2030 타겟 고객의 접근성은 매우 뛰어난 알짜 매물입니다.',
    realEstateInfo: {
      grids: [
        {
          label: '평균 보증금',
          value: '5,000만원',
          icon: <Wallet className="w-5 h-5 text-blue-600" />,
        },
        {
          label: '평균 월세',
          value: '280만원',
          icon: <Coins className="w-5 h-5 text-indigo-600" />,
        },
        {
          label: '평균 권리금',
          value: '3,500만원',
          icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
        },
        {
          label: '평균 평수',
          value: '25평',
          icon: <Maximize2 className="w-5 h-5 text-green-600" />,
        },
      ],
      listings: [
        {
          name: '성수동 카페거리 메인 1층',
          status: '계약가능',
          price: '보증금 5,000 / 월 300',
          details: '30평 · 권리금 4,000 · 즉시입주',
        }
      ],
    },
    stats: [
      { label: '권리금', value: '없음', sub: '무권리' },
      {
        label: '월 임대료',
        value: '220만원',
        sub: '시세 대비 -15%',
        color: 'text-green-600',
      },
      { label: '전용 면적', value: '66㎡', sub: '약 20평' },
    ],
  },
];
