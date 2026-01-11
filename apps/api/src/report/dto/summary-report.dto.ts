import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetSummaryReportQueryDto {
  @IsString()
  @IsNotEmpty()
  industryCode: string;

  @IsString()
  @IsNotEmpty()
  regionCode: string;

  @IsString()
  @IsOptional()
  industryName?: string;

  @IsString()
  @IsOptional()
  regionName?: string;
}

export interface SummaryReportResponse {
  meta: {
    generatedAt: string;
    category: string;
    subCategory?: string;
    region: string;
    radius: number;
    period: string;
  };

  // 0) 위치/공간 정보
  locationInfo: {
    areaType: string; // 상권 유형 코드 (예: 'A', 'D')
    areaTypeName: string; // 상권 유형명 (예: '발달상권', '골목상권', '행정동')
    guName: string; // 소속 구 (예: '강남구')
    dongName: string; // 소속 동 (예: '역삼1동')
    area: number; // 면적 (㎡)
  };

  // 1) 핵심 지표
  keyMetrics: {
    estimatedMonthlySales: {
      max: number;
    };
    wellDoingMonthlySales: {
      max: number;
    };
    floatingPopulation: {
      count: number;
      mainTime: string;
    };
    mainVisitDays: {
      days: string[];
      comment: string;
    };
    coreCustomer: {
      ageGroup: string;
      comment: string;
    };
    competitionIntensity: {
      level: '높음' | '보통' | '낮음' | '데이터 부족';
      comment: string;
    };
  };

  // 2) 상권 개요
  zoneOverview: {
    characteristics: string;
    visitMotivation: string;
    peakTime: string;
    inflowPath: string;
  };

  // 3) 고객 구성(성별)
  customerComposition: {
    malePercentage: number;
    femalePercentage: number;
  };

  // 4) 연령대 분포
  ageDistribution: {
    age10: number;
    age20: number;
    age30: number;
    age40: number;
    age50Plus: number;
  };

  // 5) 인사이트 (프론트엔드 요구사항 추가)
  summaryInsights: {
    category: '패턴' | '고객' | '상권' | '데이터 부족';
    content: string;
    highlight?: string;
  }[];

  // 6) 시간대별 유동
  hourlyFlow: {
    summary: string;
    data: {
      timeRange: string;
      level: '보통' | '낮음' | '상승' | '피크' | '높음' | '데이터 부족';
      intensity: number;
    }[];
  };

  // 7) 요일별 특성
  weeklyCharacteristics: {
    day: string;
    characteristics: string;
  }[];

  // 8) 경쟁/상권 구조
  competitionAnalysis: {
    category: string;
    summary: string;
    implication: string;
  }[];

  // 8-1) 시장 동향 (New)
  marketTrends: {
    opbizRt: number; // 개업률
    clsbizRt: number; // 폐업률
    opbizStoreCount: number; // 개업 점포 수
    clsbizStoreCount: number; // 폐업 점포 수
  };

  // 9) 결론 (프론트엔드 요구사항 추가)
  conclusion: {
    category: '운영' | '상품' | '마케팅' | '데이터 부족';
    content: string;
    highlight?: string;
  }[];

  // 10) 매출 분석
  revenueAnalysis: {
    monthlyTotal: number;
    avgTransactionPrice: number;
    totalTransactionCount: number;
    weekdayComparison: {
      weekday: number;
      weekend: number;
    };
    dailyRatio: {
      day: string;
      ratio: number;
    }[];
    timePeriodRatio: {
      timeRange: string;
      ratio: number;
    }[];
  };

  // 11) 매출 TOP 업종
  topIndustries: {
    rank: number;
    industryCode: string;
    industryName: string;
    salesAmount: number;
  }[];

  // -----------------------------------------
  // 12) 유동인구 분석 (TrafficContent 전용)
  // -----------------------------------------
  footTrafficAnalysis: {
    /** 일일 총 유동인구 (명) */
    dailyTotal: number;
    /** 피크 시간대 (예: "17~21시") */
    peakTimeSlot: string;
    /** 피크 요일 (예: "화요일") */
    peakDay: string;

    /** 성별 비율 (%) - 합계 100% */
    genderRatio: {
      male: number;
      female: number;
    };

    /** 시간대별 방문 비중 (%) */
    timeSlotRatio: {
      timeRange: string; // 예: "00~06시"
      ratio: number; // 비율 (%)
      count: number; // 실제 인원수
    }[];

    /** 연령대별 방문 비중 (%) */
    ageGroupRatio: {
      ageGroup: string; // 예: "10대", "20대", ...
      ratio: number; // 비율 (%)
      count: number; // 실제 인원수
    }[];
  };
}
