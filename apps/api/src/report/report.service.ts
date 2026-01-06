import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { SummaryReportResponse } from './dto/summary-report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly repository: ReportRepository) {}

  async getSummaryReport(
    regionCode: string,
    industryCode: string,
    fallbackIndustryName?: string,
    fallbackRegionName?: string,
  ): Promise<SummaryReportResponse> {
    const [
      sales,
      footTraffic,
      storeStats,
      area,
      industry,
      income,
      topIndustriesRaw,
      areaDetails,
    ] = await Promise.all([
      this.repository.getLatestSales(regionCode, industryCode),
      this.repository.getLatestFootTraffic(regionCode),
      this.repository.getStoreDensity(regionCode, industryCode),
      this.repository.getAreaName(regionCode),
      this.repository.getIndustryName(industryCode),
      this.repository.getLatestIncome(regionCode),
      this.repository.getTopIndustriesBySales(regionCode),
      this.repository.getAreaDetails(regionCode),
    ]);

    // 매출 TOP 업종 가공 (중복 업종 제거)
    const seenCodes = new Set<string>();
    const topIndustries = topIndustriesRaw
      .filter((item) => {
        if (seenCodes.has(item.svc_induty_cd)) return false;
        seenCodes.add(item.svc_induty_cd);
        return true;
      })
      .slice(0, 10)
      .map((item, idx) => ({
        rank: idx + 1,
        industryCode: item.svc_induty_cd,
        industryName: item.svc_induty_cd_nm,
        salesAmount: Number(item.thsmon_selng_amt),
      }));

    // 지역 또는 산업 정보가 완전히 없는 경우에만 에러를 던지고,
    // 최소한의 정보(fallbackName 등)가 있으면 분석을 최대한 진행합니다.
    if (!area && !fallbackRegionName && !sales && !footTraffic) {
      throw new NotFoundException(
        `선택하신 지역(코드: ${regionCode})에 대한 정보를 찾을 수 없습니다.`,
      );
    }

    const defaultSales = {
      thsmon_selng_amt: 0,
      thsmon_selng_co: 0,
      mdwk_selng_amt: 0,
      wkend_selng_amt: 0,
      mon_selng_amt: 0,
      tues_selng_amt: 0,
      wed_selng_amt: 0,
      thur_selng_amt: 0,
      fri_selng_amt: 0,
      sat_selng_amt: 0,
      sun_selng_amt: 0,
      tmzon_00_06_selng_amt: 0,
      tmzon_06_11_selng_amt: 0,
      tmzon_11_14_selng_amt: 0,
      tmzon_14_17_selng_amt: 0,
      tmzon_17_21_selng_amt: 0,
      tmzon_21_24_selng_amt: 0,
      ml_selng_amt: 0,
      fml_selng_amt: 0,
      agrde_10_selng_amt: 0,
      agrde_20_selng_amt: 0,
      agrde_30_selng_amt: 0,
      agrde_40_selng_amt: 0,
      agrde_50_selng_amt: 0,
      agrde_60_above_selng_amt: 0,
    };

    const activeSales = sales || defaultSales;
    const areaName =
      area?.adstrd_nm || fallbackRegionName || `지역(${regionCode})`;

    // 업종명 결정: service_industry 테이블 -> 매출 데이터 -> 프론트엔드 전달값 -> 코드값
    const salesWithIndustryName = sales as { svc_induty_cd_nm: string } | null;
    const industryName =
      industry?.service_industry_nm ||
      salesWithIndustryName?.svc_induty_cd_nm ||
      fallbackIndustryName ||
      `업종(${industryCode})`;

    // 1) 랭킹 및 텍스트 지표용 데이터 추출
    const storeCount = storeStats?.stor_co || 0;
    const totalRevenue = Number(activeSales.thsmon_selng_amt);
    const avgRevenue = totalRevenue / (storeCount || 1) / 3;

    // 3) 연령대별 매출 피크
    const ageSales = [
      { name: '10대', value: Number(activeSales.agrde_10_selng_amt) },
      { name: '20대', value: Number(activeSales.agrde_20_selng_amt) },
      { name: '30대', value: Number(activeSales.agrde_30_selng_amt) },
      { name: '40대', value: Number(activeSales.agrde_40_selng_amt) },
      { name: '50대', value: Number(activeSales.agrde_50_selng_amt) },
      {
        name: '60대 이상',
        value: Number(activeSales.agrde_60_above_selng_amt),
      },
    ];
    const sortedAges = [...ageSales].sort((a, b) => b.value - a.value);
    const peakAgeGroup =
      sortedAges[0].value > 0 ? sortedAges[0].name : '데이터 부족';

    // 4) 경쟁 강도 결정
    const competitionIntensity =
      storeCount > 100
        ? 'High'
        : storeCount > 30
          ? 'Medium'
          : storeCount > 0
            ? 'Low'
            : 'None';

    // 5) 유동인구 시간대별 집계 (Foot Traffic)
    const ftTimes = [
      {
        name: '00~06시',
        value: Number(footTraffic?.tmzon_00_06_flpop_co || 0),
      },
      {
        name: '06~11시',
        value: Number(footTraffic?.tmzon_06_11_flpop_co || 0),
      },
      {
        name: '11~14시',
        value: Number(footTraffic?.tmzon_11_14_flpop_co || 0),
      },
      {
        name: '14~17시',
        value: Number(footTraffic?.tmzon_14_17_flpop_co || 0),
      },
      {
        name: '17~21시',
        value: Number(footTraffic?.tmzon_17_21_flpop_co || 0),
      },
      {
        name: '21~24시',
        value: Number(footTraffic?.tmzon_21_24_flpop_co || 0),
      },
    ];
    const ftTotal = ftTimes.reduce((sum, t) => sum + t.value, 0);
    const sortedFT = [...ftTimes].sort((a, b) => b.value - a.value);
    const peakFTTime = sortedFT[0].value > 0 ? sortedFT[0].name : '데이터 부족';
    const maxFT = Math.max(...ftTimes.map((t) => t.value));

    // 매출 분석용 변수 복구 (revenueAnalysis에서 사용)
    const days = [
      { name: '월', value: Number(activeSales.mon_selng_amt) },
      { name: '화', value: Number(activeSales.tues_selng_amt) },
      { name: '수', value: Number(activeSales.wed_selng_amt) },
      { name: '목', value: Number(activeSales.thur_selng_amt) },
      { name: '금', value: Number(activeSales.fri_selng_amt) },
      { name: '토', value: Number(activeSales.sat_selng_amt) },
      { name: '일', value: Number(activeSales.sun_selng_amt) },
    ];

    const times = [
      { name: '00~06시', value: Number(activeSales.tmzon_00_06_selng_amt) },
      { name: '06~11시', value: Number(activeSales.tmzon_06_11_selng_amt) },
      { name: '11~14시', value: Number(activeSales.tmzon_11_14_selng_amt) },
      { name: '14~17시', value: Number(activeSales.tmzon_14_17_selng_amt) },
      { name: '17~21시', value: Number(activeSales.tmzon_17_21_selng_amt) },
      { name: '21~24시', value: Number(activeSales.tmzon_21_24_selng_amt) },
    ];

    // 6) 성별 구성
    const maleRevenue = Number(activeSales.ml_selng_amt);
    const femaleRevenue = Number(activeSales.fml_selng_amt);
    const totalGenderRevenue = maleRevenue + femaleRevenue;
    const malePercentage =
      totalGenderRevenue > 0
        ? Number(((maleRevenue / totalGenderRevenue) * 100).toFixed(1))
        : 0;
    const femalePercentage =
      totalGenderRevenue > 0 ? Number((100 - malePercentage).toFixed(1)) : 0;

    // 7) 유동인구 요일별 특성
    const weekDayTraffic =
      (Number(footTraffic?.mon_flpop_co || 0) +
        Number(footTraffic?.tues_flpop_co || 0) +
        Number(footTraffic?.wed_flpop_co || 0) +
        Number(footTraffic?.thur_flpop_co || 0)) /
      4;
    const friTraffic = Number(footTraffic?.fri_flpop_co || 0);
    const satTraffic = Number(footTraffic?.sat_flpop_co || 0);
    const sunTraffic = Number(footTraffic?.sun_flpop_co || 0);

    // 8) 유동인구 요일별 피크 (Foot Traffic Peak Day)
    const ftDays = [
      { name: '월', value: Number(footTraffic?.mon_flpop_co || 0) },
      { name: '화', value: Number(footTraffic?.tues_flpop_co || 0) },
      { name: '수', value: Number(footTraffic?.wed_flpop_co || 0) },
      { name: '목', value: Number(footTraffic?.thur_flpop_co || 0) },
      { name: '금', value: Number(footTraffic?.fri_flpop_co || 0) },
      { name: '토', value: Number(footTraffic?.sat_flpop_co || 0) },
      { name: '일', value: Number(footTraffic?.sun_flpop_co || 0) },
    ];
    const sortedFTDays = [...ftDays].sort((a, b) => b.value - a.value);
    const peakFTDay =
      sortedFTDays[0].value > 0 ? sortedFTDays[0].name : '데이터 부족';

    // 8) 경쟁/상권 구조
    const avgIncome = income?.mt_avrg_income_amt || 0;
    const linkedIndustries = topIndustries
      .filter((i) => i.industryName !== industryName)
      .slice(0, 3)
      .map((i) => i.industryName)
      .join(', ');

    // 4) 연령대 분포 계산 및 보정 (합계 100% 보장)
    const ageAges = [
      { name: '10대', value: Number(activeSales.agrde_10_selng_amt) },
      { name: '20대', value: Number(activeSales.agrde_20_selng_amt) },
      { name: '30대', value: Number(activeSales.agrde_30_selng_amt) },
      { name: '40대', value: Number(activeSales.agrde_40_selng_amt) },
      { name: '50대', value: Number(activeSales.agrde_50_selng_amt) },
      {
        name: '60대 이상',
        value: Number(activeSales.agrde_60_above_selng_amt),
      },
    ];
    const age10 = Number(
      this.calcRatio(Number(activeSales.agrde_10_selng_amt), ageAges).toFixed(
        1,
      ),
    );
    const age20 = Number(
      this.calcRatio(Number(activeSales.agrde_20_selng_amt), ageAges).toFixed(
        1,
      ),
    );
    const age30 = Number(
      this.calcRatio(Number(activeSales.agrde_30_selng_amt), ageAges).toFixed(
        1,
      ),
    );
    const age40 = Number(
      this.calcRatio(Number(activeSales.agrde_40_selng_amt), ageAges).toFixed(
        1,
      ),
    );
    const age50Plus = Number(
      (100 - (age10 + age20 + age30 + age40)).toFixed(1),
    );

    const baseResult = {
      meta: {
        generatedAt: new Date().toISOString().split('T')[0],
        category: industryName,
        region: areaName,
        radius: 500, // 기본값
        period: '최근 분기',
      },
      locationInfo: {
        areaType: areaDetails?.areaType || '',
        areaTypeName: areaDetails?.areaTypeName || '데이터 부족',
        guName: areaDetails?.guName || '',
        dongName: areaDetails?.dongName || '',
        area: areaDetails?.area || 0,
      },
      keyMetrics: {
        estimatedMonthlySales: {
          max: avgRevenue > 0 ? Math.floor(avgRevenue * 1.5) : 0,
        },
        wellDoingMonthlySales: {
          max: avgRevenue > 0 ? Math.floor(avgRevenue * 2.0) : 0,
        },
        floatingPopulation: {
          count: Number(footTraffic?.tot_flpop_co || 0),
          mainTime: peakFTTime,
        },
        mainVisitDays: {
          days: peakFTDay !== '데이터 부족' ? [peakFTDay] : [],
          comment:
            peakFTDay !== '데이터 부족'
              ? `${peakFTDay}요일에 유동인구가 가장 집중됩니다.`
              : '데이터 부족',
        },
        coreCustomer: {
          ageGroup: peakAgeGroup,
          comment:
            peakAgeGroup !== '데이터 부족'
              ? `${peakAgeGroup} 고객의 구매력이 가장 높습니다.`
              : '데이터 부족',
        },
        competitionIntensity: {
          level:
            competitionIntensity === 'High'
              ? '높음'
              : competitionIntensity === 'Medium'
                ? '보통'
                : competitionIntensity === 'Low'
                  ? '낮음'
                  : '데이터 부족',
          comment:
            competitionIntensity !== 'None'
              ? `주변에 동종 업종이 ${storeCount}개 있어 경쟁이 ${competitionIntensity === 'High' ? '치열함' : '완만함'}`
              : '데이터 부족',
        },
      },
      zoneOverview: {
        characteristics:
          areaName !== '데이터 부족' ? `${areaName} 상권` : '데이터 부족',
        visitMotivation:
          peakFTTime !== '데이터 부족'
            ? `${peakFTTime} 중심 소비`
            : '데이터 부족',
        peakTime: peakFTTime,
        inflowPath:
          peakFTTime !== '데이터 부족' ? '지역내 유동 중심' : '데이터 부족',
      },
      customerComposition: {
        malePercentage,
        femalePercentage,
      },
      ageDistribution: {
        age10,
        age20,
        age30,
        age40,
        age50Plus,
      },
      summaryInsights: [
        {
          category: '패턴',
          content:
            peakFTTime !== '데이터 부족' && peakFTDay !== '데이터 부족'
              ? `${peakFTTime} 시간대와 ${peakFTDay}요일에 유동인구가 집중되어 효율적인 운영이 필요합니다.`
              : '데이터 부족',
          highlight: peakFTTime !== '데이터 부족' ? peakFTTime : '',
        },
        {
          category: '고객',
          content:
            peakAgeGroup !== '데이터 부족'
              ? `${peakAgeGroup} 비중이 높아 해당 연령층을 겨냥한 맞춤 전략이 효과적입니다.`
              : '데이터 부족',
          highlight: peakAgeGroup !== '데이터 부족' ? peakAgeGroup : '',
        },
        {
          category: '상권',
          content:
            competitionIntensity !== 'None'
              ? `경쟁 강도가 ${competitionIntensity === 'High' ? '높은 편이므로' : '완만하여'} 차별화된 경쟁력 확보가 중요합니다.`
              : '데이터 부족',
          highlight: '차별화된 경쟁력',
        },
      ],
      hourlyFlow: {
        summary:
          ftTotal > 0
            ? ftTimes[4].value > ftTimes[2].value
              ? '저녁 시간대 유동인구 집중'
              : '점심 시간대 유동인구 집중'
            : '데이터 부족',
        data: ftTimes.map((t) => ({
          timeRange: t.name,
          level:
            t.value === maxFT
              ? '피크'
              : t.value > ftTotal / 6
                ? '높음'
                : t.value > 0
                  ? '보통'
                  : '데이터 부족',
          intensity: ftTotal > 0 ? (t.value / ftTotal) * 100 : 0,
        })),
      },
      weeklyCharacteristics: [
        {
          day: '월~목',
          characteristics:
            footTraffic && weekDayTraffic > 100000
              ? '직장인 중심 수요 활발'
              : footTraffic && weekDayTraffic > 0
                ? '안정적 유동 유지'
                : '데이터 부족',
        },
        {
          day: '금',
          characteristics:
            footTraffic && friTraffic > weekDayTraffic * 1.2
              ? '주말 전야 수요 급증'
              : footTraffic && friTraffic > 0
                ? '평시 수준 유지'
                : '데이터 부족',
        },
        {
          day: '토',
          characteristics:
            footTraffic && satTraffic > weekDayTraffic * 1.5
              ? '외부 유입 최대'
              : footTraffic && satTraffic > 0
                ? '여가 중심 이동'
                : '데이터 부족',
        },
        {
          day: '일',
          characteristics:
            footTraffic && sunTraffic > 0
              ? sunTraffic < satTraffic
                ? '저녁 이후 유동 감소'
                : '오후 시간 수요 지속'
              : '데이터 부족',
        },
      ],
      competitionAnalysis: [
        {
          category: '동종 업종 밀집',
          summary: sales
            ? `주변에 동종 업종 ${storeCount}개가 존재합니다.`
            : '데이터 부족',
          implication:
            sales && competitionIntensity === 'High'
              ? '브랜드 차별화 필수'
              : sales && competitionIntensity !== 'None'
                ? '안정적 진입 가능'
                : '데이터 부족',
        },
        {
          category: '가격대 경쟁',
          summary:
            income && avgIncome > 4000000
              ? '고소득층 다수 거주 상권입니다.'
              : income && avgIncome > 0
                ? '실속형 소비 중심 상권입니다.'
                : '데이터 부족',
          implication:
            income && avgIncome > 4000000
              ? '프리미엄 전략 유효'
              : income && avgIncome > 0
                ? '가성비 위주 구성 제안'
                : '데이터 부족',
        },
        {
          category: '연계 업종',
          summary:
            topIndustries.length > 0
              ? `주변 ${linkedIndustries} 업종이 활성화되어 있습니다.`
              : '데이터 부족',
          implication:
            topIndustries.length > 0
              ? '2차 소비 연계 마케팅 효과적'
              : '데이터 부족',
        },
      ],
      conclusion: [
        {
          category: '운영',
          content:
            peakFTTime !== '데이터 부족'
              ? `${peakFTTime} 시간대 효율적인 인력 배치가 필요합니다.`
              : '데이터 부족',
          highlight: '인력 배치',
        },
        {
          category: '상품',
          content:
            peakAgeGroup !== '데이터 부족'
              ? `${peakAgeGroup} 취향을 저격할 시그니처 메뉴 개발을 추천합니다.`
              : '데이터 부족',
          highlight: '시그니처 메뉴',
        },
        {
          category: '마케팅',
          content:
            peakFTDay !== '데이터 부족'
              ? `${peakFTDay}요일 방문객 극대화를 위한 로컬 마케팅을 강화하세요.`
              : '데이터 부족',
          highlight: '로컬 마케팅',
        },
      ],
    };

    const result: SummaryReportResponse = {
      ...(baseResult as Omit<
        SummaryReportResponse,
        'revenueAnalysis' | 'topIndustries'
      >),
      topIndustries,
      revenueAnalysis: {
        monthlyTotal: Math.floor(avgRevenue),
        avgTransactionPrice:
          totalRevenue > 0
            ? Math.floor(
                totalRevenue / (Number(activeSales.thsmon_selng_co) || 1),
              )
            : 0,
        totalTransactionCount: Math.floor(
          (Number(activeSales.thsmon_selng_co) || 0) / (storeCount || 1) / 3,
        ),
        weekdayComparison: {
          weekday: Number(
            this.calcRatio(Number(activeSales.mdwk_selng_amt), [
              { value: Number(activeSales.mdwk_selng_amt) },
              { value: Number(activeSales.wkend_selng_amt) },
            ]).toFixed(1),
          ),
          weekend: 0, // 아래에서 보정
        },
        dailyRatio: days.map((d) => ({
          day: d.name,
          ratio: Number(this.calcRatio(d.value, days).toFixed(1)),
        })),
        timePeriodRatio: times.map((t) => ({
          timeRange: t.name,
          ratio: Number(this.calcRatio(t.value, times).toFixed(1)),
        })),
      },
    };

    // 주말 비중 보정
    if (result.revenueAnalysis.weekdayComparison.weekday > 0) {
      result.revenueAnalysis.weekdayComparison.weekend = Number(
        (100 - result.revenueAnalysis.weekdayComparison.weekday).toFixed(1),
      );
    }

    return result;
  }

  private calcRatio(value: number, all: { value: number }[]): number {
    const total = all.reduce((sum, item) => sum + item.value, 0);
    return total > 0 ? (value / total) * 100 : 0;
  }
}
