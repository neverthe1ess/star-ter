export const TOOLS = [
  {
    type: 'function',
    name: 'get_store',
    description: '상권 기본 요약 정보를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: 'areaCd 값을 이용하여 상권 정보를 가져온다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_foot_traffic',
    description: '유동인구 요약 정보를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: 'areaCd 값을 이용하여 유동인구 정보를 가져온다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_resident_population',
    description: '상주인구 요약 정보를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: 'areaCd 값을 이용하여 상주인구 정보를 가져온다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_working_population',
    description: '직장인구 요약 정보를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: 'areaCd 값을 이용하여 직장인구 정보를 가져온다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_sales_top_industries',
    description: '상권 내 업종별 매출 상위를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: 'areaCd 값을 이용하여 매출 상위 업종을 조회한다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_store_top_industries',
    description: '상권 내 업종별 점포/경쟁 상위를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: 'areaCd 값을 이용하여 점포 상위 업종을 조회한다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_income_consumption',
    description: '소득/소비 요약 정보를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: 'areaCd 값을 이용하여 소득/소비 정보를 가져온다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_commercial_change',
    description: '상권 변화지표 요약 정보를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: 'areaCd 값을 이용하여 상권 변화지표 정보를 가져온다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'compare_commercial_areas',
    description: '상권 2개 이상을 비교합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCdList: {
          type: 'array',
          items: { type: 'string' },
          description: '비교할 상권의 areaCd 목록입니다.',
        },
      },
      required: ['areaCdList'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_industry_commercial_summary',
    description: '특정 상권에서 특정 업종의 매출/점포/인구 요약을 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: '조회할 상권의 areaCd입니다.',
        },
        categoryCode: {
          type: 'string',
          description: '조회할 업종 코드(svc_induty_cd)입니다.',
        },
      },
      required: ['areaCd', 'categoryCode'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'recommend_commercial_by_industry',
    description: '특정 업종의 매출 상위 상권을 추천합니다.',
    parameters: {
      type: 'object',
      properties: {
        categoryCode: {
          type: 'string',
          description: '추천할 업종 코드(svc_induty_cd)입니다.',
        },
      },
      required: ['categoryCode'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'compare_commercial_by_industry',
    description: '특정 업종 기준으로 여러 상권을 비교합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCodes: {
          type: 'array',
          items: { type: 'string' },
          description: '비교할 상권의 areaCd 목록입니다.',
        },
        categoryCode: {
          type: 'string',
          description: '비교할 업종 코드(svc_induty_cd)입니다.',
        },
      },
      required: ['areaCodes', 'categoryCode'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'recommend_real_estate',
    description: '조건에 맞는 부동산 매물을 추천합니다.',
    parameters: {
      type: 'object',
      properties: {
        maxDeposit: {
          type: 'number',
          description: '최대 보증금 (단위: 만원)',
        },
        maxMonthlyRent: {
          type: 'number',
          description: '최대 월세 (단위: 만원)',
        },
        minSize: {
          type: 'number',
          description: '최소 면적 (평수 또는 제곱미터)',
        },
        keywords: {
          type: 'string',
          description: '검색 키워드 (예: "치킨집", "1층", "카페")',
        },
      },
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: 'function',
    name: 'get_foot_traffic_timeseries',
    description:
      '상권의 분기별 유동인구 추이(시계열 데이터)를 조회합니다. 차트를 그릴 때 사용합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: '조회할 상권의 areaCd입니다.',
        },
        limit: {
          type: 'number',
          description: '조회할 최근 분기 개수 (기본값: 8)',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: 'function',
    name: 'get_foot_traffic_detail',
    description:
      '상권의 시간대별(0~24시), 요일별(월~일) 유동인구 상세 데이터를 조회합니다. 언제 사람이 가장 많은지 분석할 때 사용합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: '조회할 상권의 areaCd입니다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_competition_analysis',
    description:
      '상권 내 특정 업종의 경쟁 강도(점포 수)와 리스크(개폐업률)를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: '조회할 상권의 areaCd입니다.',
        },
        categoryCode: {
          type: 'string',
          description: '조회할 업종 코드(svc_induty_cd)입니다.',
        },
      },
      required: ['areaCd', 'categoryCode'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_commercial_risk',
    description:
      '상권의 장기적 리스크(상권 등급, 평균 생존 기간)를 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: '조회할 상권의 areaCd입니다.',
        },
      },
      required: ['areaCd'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'estimate_revenue_and_cost',
    description:
      '사용자가 "얼마 벌어?", "수익", "순수익", "창업하면" 등의 질문을 할 때 반드시 이 도구를 사용해야 합니다! 상권/업종의 예상 매출과 비용(임대료)을 분석하여 추정 순수익을 계산합니다.',
    parameters: {
      type: 'object',
      properties: {
        areaCd: {
          type: 'string',
          description: '조회할 상권의 areaCd입니다.',
        },
        categoryCode: {
          type: 'string',
          description: '조회할 업종 코드(svc_induty_cd)입니다.',
        },
        deposit: {
          type: 'number',
          description: '매물의 보증금 (단위: 만원). 선택 사항입니다.',
        },
        monthlyRent: {
          type: 'number',
          description: '매물의 월세 (단위: 만원). 선택 사항입니다.',
        },
        size: {
          type: 'number',
          description: '매물의 평수 (단위: 평). 기본값은 15평입니다.',
        },
        floor: {
          type: 'number',
          description: '매물의 층수. 기본값은 1층입니다.',
        },
      },
      required: ['areaCd', 'categoryCode'],
      additionalProperties: false,
    },
    strict: false,
  },
];
