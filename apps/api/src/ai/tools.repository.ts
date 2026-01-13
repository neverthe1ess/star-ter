import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryParams } from './dto/query-dto';
import { BUSINESS_COSTS } from '../market/constants/business-costs';

@Injectable()
export class ToolsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 2) 상권 기본 요약(간단): 유동/상주/직장/매출/점포 (업종 합계 기준)
  async getCommercialSummary(params: QueryParams) {
    const { stdrYyquCd, areaCd } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      WITH
      sales_sum AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          SUM(thsmon_selng_amt) AS "해당 분기 매출 금액",
          SUM(thsmon_selng_co) AS "해당 분기 매출 건수",
          SUM(mdwk_selng_amt) AS "주중 매출 금액",
          SUM(wkend_selng_amt) AS "주말 매출 금액"
        FROM v_sales
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_cd = ${areaCd}
        GROUP BY 1, 2, 3, 4, 5, 6
      ),
      store_sum AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          SUM(stor_co) AS "점포 수",
          SUM(similr_induty_stor_co) AS "유사 업종 점포 수",
          SUM(frc_stor_co) AS "프랜차이즈 점포 수"
        FROM v_store
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_cd = ${areaCd}
        GROUP BY 1, 2, 3, 4, 5, 6
      )
      SELECT
        sales_sum."기준 년분기 코드" AS "매출 기준 년분기 코드",
        sales_sum."지역 수준" AS "지역 수준",
        sales_sum."지역 코드" AS "지역 코드",
        sales_sum."지역 이름" AS "지역 이름",
        sales_sum."상권 구분 코드" AS "상권 구분 코드",
        sales_sum."상권 구분 코드 명" AS "상권 구분 코드 명",
        ft.tot_flpop_co AS "총 유동인구",
        rp.tot_repop_co AS "총 상주인구",
        wp.tot_wrc_popltn_co AS "총 직장인구",
        sales_sum."해당 분기 매출 금액" AS "해당 분기 매출 금액",
        sales_sum."해당 분기 매출 건수" AS "해당 분기 매출 건수",
        sales_sum."주중 매출 금액" AS "주중 매출 금액",
        sales_sum."주말 매출 금액" AS "주말 매출 금액",
        store_sum."점포 수" AS "점포 수",
        store_sum."유사 업종 점포 수" AS "유사 업종 점포 수",
        store_sum."프랜차이즈 점포 수" AS "프랜차이즈 점포 수"
      FROM sales_sum
      LEFT JOIN v_foot_traffic ft
        ON ft.stdr_yyqu_cd = sales_sum."기준 년분기 코드"
      AND ft.area_level = sales_sum."지역 수준"
      AND ft.area_cd = sales_sum."지역 코드"
      AND ft.area_nm = sales_sum."지역 이름"
      AND ft.trdar_se_cd = sales_sum."상권 구분 코드"
      AND ft.trdar_se_cd_nm = sales_sum."상권 구분 코드 명"
      LEFT JOIN v_resident_population rp
        ON rp.stdr_yyqu_cd = sales_sum."기준 년분기 코드"
      AND rp.area_level = sales_sum."지역 수준"
      AND rp.area_cd = sales_sum."지역 코드"
      AND rp.area_nm = sales_sum."지역 이름"
      AND rp.trdar_se_cd = sales_sum."상권 구분 코드"
      AND rp.trdar_se_cd_nm = sales_sum."상권 구분 코드 명"
      LEFT JOIN v_working_population wp
        ON wp.stdr_yyqu_cd = sales_sum."기준 년분기 코드"
      AND wp.area_level = sales_sum."지역 수준"
      AND wp.area_cd = sales_sum."지역 코드"
      AND wp.area_nm = sales_sum."지역 이름"
      AND wp.trdar_se_cd = sales_sum."상권 구분 코드"
      AND wp.trdar_se_cd_nm = sales_sum."상권 구분 코드 명"
      LEFT JOIN store_sum
        ON store_sum."기준 년분기 코드" = sales_sum."기준 년분기 코드"
      AND store_sum."지역 수준" = sales_sum."지역 수준"
      AND store_sum."지역 코드" = sales_sum."지역 코드"
      AND store_sum."지역 이름" = sales_sum."지역 이름"
      AND store_sum."상권 구분 코드" = sales_sum."상권 구분 코드"
      AND store_sum."상권 구분 코드 명" = sales_sum."상권 구분 코드 명"
    `;
    return rows;
  }

  // 3) 유동인구 조회(간단): 핵심 지표 + 시간대/요일 일부
  async getFootTrafficSummary(params: QueryParams) {
    const { stdrYyquCd, areaCd } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      SELECT
        stdr_yyqu_cd AS "유동인구 기준 년분기 코드",
        area_level AS "지역 수준",
        area_cd AS "지역 코드",
        area_nm AS "지역 이름",
        trdar_se_cd AS "상권 구분 코드",
        trdar_se_cd_nm AS "상권 구분 코드 명",
        tot_flpop_co AS "총 유동인구",
        ml_flpop_co AS "남자 유동인구",
        fml_flpop_co AS "여자 유동인구",
        agrde_20_flpop_co AS "20대 유동인구",
        agrde_30_flpop_co AS "30대 유동인구",
        tmzon_17_21_flpop_co AS "17~21시 유동인구",
        sat_flpop_co AS "토요일 유동인구",
        sun_flpop_co AS "일요일 유동인구"
      FROM v_foot_traffic
      WHERE stdr_yyqu_cd = ${stdrYyquCd}
        AND area_cd = ${areaCd}
      LIMIT 1
    `;
    return rows;
  }

  // 4) 상주인구 조회(간단): 인구 + 가구(아파트/비아파트)
  async getResidentPopulationSummary(params: QueryParams) {
    const { stdrYyquCd, areaCd } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      SELECT
        stdr_yyqu_cd AS "상주인구 기준 년분기 코드",
        area_level AS "지역 수준",
        area_cd AS "지역 코드",
        area_nm AS "지역 이름",
        trdar_se_cd AS "상권 구분 코드",
        trdar_se_cd_nm AS "상권 구분 코드 명",
        tot_repop_co AS "총 상주인구",
        ml_repop_co AS "남자 상주인구",
        fml_repop_co AS "여자 상주인구",
        agrde_20_repop_co AS "20대 상주인구",
        agrde_30_repop_co AS "30대 상주인구",
        tot_hshld_co AS "상주인구 총 가구 수",
        apt_hshld_co AS "상주인구 아파트 가구 수",
        non_apt_hshld_co AS "상주인구 비아파트 가구 수"
      FROM v_resident_population
      WHERE stdr_yyqu_cd = ${stdrYyquCd}
        AND area_cd = ${areaCd}
      LIMIT 1
    `;
    return rows;
  }

  // 5) 직장인구 조회(간단): 인구 + 성별/연령 일부
  async getWorkingPopulationSummary(params: QueryParams) {
    const { stdrYyquCd, areaCd } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      SELECT
        stdr_yyqu_cd AS "직장인구 기준 년분기 코드",
        area_level AS "지역 수준",
        area_cd AS "지역 코드",
        area_nm AS "지역 이름",
        trdar_se_cd AS "상권 구분 코드",
        trdar_se_cd_nm AS "상권 구분 코드 명",
        tot_wrc_popltn_co AS "총 직장인구",
        ml_wrc_popltn_co AS "남자 직장인구",
        fml_wrc_popltn_co AS "여자 직장인구",
        agrde_20_wrc_popltn_co AS "20대 직장인구",
        agrde_30_wrc_popltn_co AS "30대 직장인구"
      FROM v_working_population
      WHERE stdr_yyqu_cd = ${stdrYyquCd}
        AND area_cd = ${areaCd}
      LIMIT 1
    `;
    return rows;
  }

  // 6) 매출 조회(업종 TOP): 상권 내 업종별 매출 상위
  async getSalesTopIndustries(params: QueryParams) {
    const { stdrYyquCd, areaCd, limit = 5 } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      SELECT
        stdr_yyqu_cd AS "매출 기준 년분기 코드",
        area_level AS "지역 수준",
        area_cd AS "지역 코드",
        area_nm AS "지역 이름",
        trdar_se_cd AS "상권 구분 코드",
        trdar_se_cd_nm AS "상권 구분 코드 명",
        svc_induty_cd AS "매출 서비스업종 코드",
        svc_induty_cd_nm AS "매출 서비스업종 이름",
        thsmon_selng_amt AS "해당 분기 매출 금액",
        thsmon_selng_co AS "해당 분기 매출 건수"
      FROM v_sales
      WHERE stdr_yyqu_cd = ${stdrYyquCd}
        AND area_cd = ${areaCd}
      ORDER BY thsmon_selng_amt DESC
      LIMIT ${limit}
    `;
    return rows;
  }

  // 7) 점포/경쟁 조회(업종 TOP): 상권 내 업종별 점포/경쟁/프차/개폐업
  async getStoreTopIndustries(params: QueryParams) {
    const { stdrYyquCd, areaCd, limit = 5 } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      SELECT
        stdr_yyqu_cd AS "점포 기준 년분기 코드",
        area_level AS "지역 수준",
        area_cd AS "지역 코드",
        area_nm AS "지역 이름",
        trdar_se_cd AS "상권 구분 코드",
        trdar_se_cd_nm AS "상권 구분 코드 명",
        svc_induty_cd AS "점포 서비스업종 코드",
        svc_induty_cd_nm AS "점포 서비스업종 이름",
        stor_co AS "점포 수",
        similr_induty_stor_co AS "유사 업종 점포 수",
        frc_stor_co AS "프랜차이즈 점포 수",
        opbiz_rt AS "점포 개업률",
        clsbiz_rt AS "점포 폐업률"
      FROM v_store
      WHERE stdr_yyqu_cd = ${stdrYyquCd}
        AND area_cd = ${areaCd}
      ORDER BY stor_co DESC
      LIMIT ${limit}
    `;
    return rows;
  }

  // 8) 소득/소비 조회(간단): 소득 + 소비 항목 일부
  async getIncomeConsumptionSummary(params: QueryParams) {
    const { stdrYyquCd, areaCd } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      SELECT
        stdr_yyqu_cd AS "소득소비지출 기준 년분기 코드",
        area_level AS "지역 수준",
        area_cd AS "지역 코드",
        area_nm AS "지역 이름",
        trdar_se_cd AS "상권 구분 코드",
        trdar_se_cd_nm AS "상권 구분 코드 명",
        mt_avrg_income_amt AS "소득소비지출 월평균 소득 금액",
        expndtr_totamt AS "소득소비지출 소비 지출 총액",
        fd_expndtr_totamt AS "소득소비지출 식비 소비 지출 총액",
        trnsport_expndtr_totamt AS "소득소비지출 교통 소비 지출 총액",
        plesr_expndtr_totamt AS "소득소비지출 유흥 소비 지출 총액"
      FROM v_income_consumption
      WHERE stdr_yyqu_cd = ${stdrYyquCd}
        AND area_cd = ${areaCd}
      LIMIT 1
    `;
    return rows;
  }

  // 9) 상권 변화지표 조회(간단): 상태 + 운영/폐업 개월
  async getCommercialChangeSummary(params: QueryParams) {
    const { stdrYyquCd, areaCd } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      SELECT
        stdr_yyqu_cd AS "변화지표 기준 년분기 코드",
        area_level AS "지역 수준",
        area_cd AS "지역 코드",
        area_nm AS "지역 이름",
        trdar_se_cd AS "상권 구분 코드",
        trdar_se_cd_nm AS "상권 구분 코드 명",
        trdar_chnge_ix_nm AS "변화지표 상태",
        opr_sale_mt_avrg AS "변화지표 평균 운영 영업 개월 수",
        cls_sale_mt_avrg AS "변화지표 평균 폐업 영업 개월 수",
        su_opr_sale_mt_avrg AS "변화지표 서울시 평균 운영 영업 개월 수",
        su_cls_sale_mt_avrg AS "변화지표 서울시 평균 폐업 영업 개월 수"
      FROM v_commercial_change
      WHERE stdr_yyqu_cd = ${stdrYyquCd}
        AND area_cd = ${areaCd}
      LIMIT 1
    `;
    return rows;
  }

  // 10) 상권 비교(2개 상권 예시): 유동인구  // 9) 상권 비교 (Task 2.3 -> Task 4.3 고도화)
  // 10) 상권 비교 (Task 4.3: 상권 비교 및 레이더 차트 데이터 제공)
  async compareCommercialAreas(params: QueryParams) {
    console.log('[ToolsRepository] compareCommercialAreas called:', params);
    const { areaCdList } = params;
    if (!areaCdList || areaCdList.length === 0) return [];

    // 1. 최신 분기 확인 (임시로 고정하거나 조회 필요. 여기선 DB 최신값 사용 권장하지만 편의상 20243 등 사용.
    //    정확성을 위해 먼저 최신 분기를 조회하는 것이 좋으나, 성능상 파라미터나 하드코딩 고려. 일단 '20243' 가정 or orderBy로 하나만 가져오는 방식은 groupBy에서 복잡함.
    //    User flow: stdrYyquCd defaults to '20243' in definitions but params might be empty.
    const targetQuarter = params.stdrYyquCd || '20243';

    // 2. 주요 지표 병렬 조회
    // 주의: groupBy는 prisma client에서 지원.
    const [salesStats, footTraffic, resident, working, storeStats] =
      await Promise.all([
        // 매출 (총 매출 Sum)
        this.prisma.salesCommercial.groupBy({
          by: ['trdar_cd'],
          where: {
            trdar_cd: { in: areaCdList },
            stdr_yyqu_cd: targetQuarter,
          },
          _sum: {
            thsmon_selng_amt: true,
          },
        }),
        // 유동인구
        this.prisma.footTrafficCommercial.findMany({
          where: {
            trdar_cd: { in: areaCdList },
            stdr_yyqu_cd: targetQuarter,
          },
          select: { trdar_cd: true, tot_flpop_co: true },
        }),
        // 상주인구
        this.prisma.residentPopulationCommercial.findMany({
          where: {
            trdar_cd: { in: areaCdList },
            stdr_yyqu_cd: targetQuarter,
          },
          select: { trdar_cd: true, tot_repop_co: true },
        }),
        // 직장인구
        this.prisma.workingPopulationCommercial.findMany({
          where: {
            trdar_cd: { in: areaCdList },
            stdr_yyqu_cd: targetQuarter,
          },
          select: { trdar_cd: true, tot_wrc_popltn_co: true },
        }),
        // 안정성 (폐업률 Avg)
        this.prisma.storeCommercial.groupBy({
          by: ['trdar_cd'],
          where: {
            trdar_cd: { in: areaCdList },
            stdr_yyqu_cd: targetQuarter,
          },
          _avg: {
            clsbiz_rt: true,
          },
        }),
      ]);

    // Area Name 매핑을 위해 별도 조회 필요 (groupBy 결과엔 이름 없음)
    const areaNames = await this.prisma.areaCommercial.findMany({
      where: { trdar_cd: { in: areaCdList } },
      select: { trdar_cd: true, trdar_cd_nm: true },
    });

    // 3. 데이터 병합
    const mergedData = areaCdList.map((code) => {
      const nameObj = areaNames.find((n) => n.trdar_cd === code);
      const s = salesStats.find((item) => item.trdar_cd === code);
      const f = footTraffic.find((item) => item.trdar_cd === code);
      const r = resident.find((item) => item.trdar_cd === code);
      const w = working.find((item) => item.trdar_cd === code);
      const st = storeStats.find((item) => item.trdar_cd === code);

      // 숫자 변환 (safely)
      const toNum = (v: any) => Number(v || 0);

      const revenue = toNum(s?._sum?.thsmon_selng_amt);
      const pop = this.numberSafe(f?.tot_flpop_co);
      const res = this.numberSafe(r?.tot_repop_co);
      const work = this.numberSafe(w?.tot_wrc_popltn_co);
      const closingRate = toNum(st?._avg?.clsbiz_rt);
      const stability = 100 - closingRate;

      return {
        areaCode: code,
        areaName: nameObj?.trdar_cd_nm || code,
        metrics: { revenue, pop, res, work, stability },
        raw: { closingRate },
      };
    });

    // 3. 정규화 (Max값 기준 점수화, 0 div 방지)
    const maxValues = {
      revenue: Math.max(...mergedData.map((d) => d.metrics.revenue)) || 1,
      pop: Math.max(...mergedData.map((d) => d.metrics.pop)) || 1,
      res: Math.max(...mergedData.map((d) => d.metrics.res)) || 1,
      work: Math.max(...mergedData.map((d) => d.metrics.work)) || 1,
      stability: 100, // 안정성은 절대값(100점 만점) 사용
    };

    const radarData = mergedData.map((d) => ({
      areaName: d.areaName,
      scores: {
        revenue: Math.min(
          100,
          Math.round((d.metrics.revenue / maxValues.revenue) * 100),
        ),
        pop: Math.min(100, Math.round((d.metrics.pop / maxValues.pop) * 100)),
        res: Math.min(100, Math.round((d.metrics.res / maxValues.res) * 100)),
        work: Math.min(
          100,
          Math.round((d.metrics.work / maxValues.work) * 100),
        ),
        stability: Math.round(d.metrics.stability),
      },
      rawMetrics: d.metrics,
    }));

    return {
      summary: `${mergedData.map((d) => d.areaName).join(' vs ')} 비교 결과입니다.`,
      data: radarData,
      meta: {
        unit: '점수(0~100)',
        indicators: [
          '매출',
          '유동인구',
          '주거인구',
          '직장인구',
          '안정성(100-폐업률)',
        ],
      },
    };
  }

  // 12) 업종별 상권 분석(간단): 상권 1개 + 업종 1개
  async getIndustryCommercialSummary(params: QueryParams) {
    const { stdrYyquCd, areaCd, categoryCode } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      WITH
      industry_sales AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          svc_induty_cd AS "서비스업종 코드",
          svc_induty_cd_nm AS "서비스업종 이름",
          SUM(thsmon_selng_amt) AS "해당 분기 매출 금액",
          SUM(thsmon_selng_co) AS "해당 분기 매출 건수",
          SUM(mdwk_selng_amt) AS "주중 매출 금액",
          SUM(wkend_selng_amt) AS "주말 매출 금액"
        FROM v_sales
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_cd = ${areaCd}
          AND svc_induty_cd = ${categoryCode}
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
      ),
      industry_store AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          svc_induty_cd AS "서비스업종 코드",
          SUM(stor_co) AS "점포 수",
          SUM(similr_induty_stor_co) AS "유사 업종 점포 수",
          SUM(frc_stor_co) AS "프랜차이즈 점포 수",
          AVG(opbiz_rt) AS "점포 개업률",
          SUM(opbiz_stor_co) AS "개업 점포 수",
          AVG(clsbiz_rt) AS "점포 폐업률",
          SUM(clsbiz_stor_co) AS "폐업 점포 수"
        FROM v_store
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_cd = ${areaCd}
          AND svc_induty_cd = ${categoryCode}
        GROUP BY 1, 2, 3, 4, 5, 6, 7
      )
      SELECT
        industry_sales."기준 년분기 코드" AS "매출 기준 년분기 코드",
        industry_sales."지역 수준" AS "지역 수준",
        industry_sales."지역 코드" AS "지역 코드",
        industry_sales."지역 이름" AS "지역 이름",
        industry_sales."상권 구분 코드" AS "상권 구분 코드",
        industry_sales."상권 구분 코드 명" AS "상권 구분 코드 명",
        ft.tot_flpop_co AS "총 유동인구",
        rp.tot_repop_co AS "총 상주인구",
        wp.tot_wrc_popltn_co AS "총 직장인구",
        industry_sales."서비스업종 코드" AS "매출 서비스업종 코드",
        industry_sales."서비스업종 이름" AS "매출 서비스업종 이름",
        industry_sales."해당 분기 매출 금액" AS "해당 분기 매출 금액",
        industry_sales."해당 분기 매출 건수" AS "해당 분기 매출 건수",
        industry_sales."주중 매출 금액" AS "주중 매출 금액",
        industry_sales."주말 매출 금액" AS "주말 매출 금액",
        industry_store."점포 수" AS "점포 수",
        industry_store."유사 업종 점포 수" AS "유사 업종 점포 수",
        industry_store."프랜차이즈 점포 수" AS "프랜차이즈 점포 수",
        industry_store."점포 개업률" AS "점포 개업률",
        industry_store."개업 점포 수" AS "개업 점포 수",
        industry_store."점포 폐업률" AS "점포 폐업률",
        industry_store."폐업 점포 수" AS "폐업 점포 수"
      FROM industry_sales
      LEFT JOIN v_foot_traffic ft
        ON ft.stdr_yyqu_cd = industry_sales."기준 년분기 코드"
      AND ft.area_level = industry_sales."지역 수준"
      AND ft.area_cd = industry_sales."지역 코드"
      AND ft.area_nm = industry_sales."지역 이름"
      AND ft.trdar_se_cd = industry_sales."상권 구분 코드"
      AND ft.trdar_se_cd_nm = industry_sales."상권 구분 코드 명"
      LEFT JOIN v_resident_population rp
        ON rp.stdr_yyqu_cd = industry_sales."기준 년분기 코드"
      AND rp.area_level = industry_sales."지역 수준"
      AND rp.area_cd = industry_sales."지역 코드"
      AND rp.area_nm = industry_sales."지역 이름"
      AND rp.trdar_se_cd = industry_sales."상권 구분 코드"
      AND rp.trdar_se_cd_nm = industry_sales."상권 구분 코드 명"
      LEFT JOIN v_working_population wp
        ON wp.stdr_yyqu_cd = industry_sales."기준 년분기 코드"
      AND wp.area_level = industry_sales."지역 수준"
      AND wp.area_cd = industry_sales."지역 코드"
      AND wp.area_nm = industry_sales."지역 이름"
      AND wp.trdar_se_cd = industry_sales."상권 구분 코드"
      AND wp.trdar_se_cd_nm = industry_sales."상권 구분 코드 명"
      LEFT JOIN industry_store
        ON industry_store."기준 년분기 코드" = industry_sales."기준 년분기 코드"
      AND industry_store."지역 수준" = industry_sales."지역 수준"
      AND industry_store."지역 코드" = industry_sales."지역 코드"
      AND industry_store."지역 이름" = industry_sales."지역 이름"
      AND industry_store."상권 구분 코드" = industry_sales."상권 구분 코드"
      AND industry_store."상권 구분 코드 명" = industry_sales."상권 구분 코드 명"
      AND industry_store."서비스업종 코드" = industry_sales."서비스업종 코드"
    `;
    return rows;
  }

  // 13) 업종별 상권 추천(간단): 특정 업종의 매출 상위 상권 TOP N
  async recommendCommercialByIndustry(params: QueryParams) {
    const { stdrYyquCd, categoryCode, limit = 5 } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      WITH
      sales AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          svc_induty_cd AS "서비스업종 코드",
          svc_induty_cd_nm AS "서비스업종 이름",
          SUM(thsmon_selng_amt) AS "해당 분기 매출 금액",
          SUM(thsmon_selng_co) AS "해당 분기 매출 건수"
        FROM v_sales
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_level = 'commercial'
          AND svc_induty_cd = ${categoryCode}
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
      ),
      store AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          svc_induty_cd AS "서비스업종 코드",
          SUM(stor_co) AS "점포 수",
          SUM(similr_induty_stor_co) AS "유사 업종 점포 수",
          SUM(frc_stor_co) AS "프랜차이즈 점포 수"
        FROM v_store
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_level = 'commercial'
          AND svc_induty_cd = ${categoryCode}
        GROUP BY 1, 2, 3, 4, 5, 6, 7
      )
      SELECT
        sales."기준 년분기 코드" AS "매출 기준 년분기 코드",
        sales."지역 수준" AS "지역 수준",
        sales."지역 코드" AS "지역 코드",
        sales."지역 이름" AS "지역 이름",
        sales."상권 구분 코드" AS "상권 구분 코드",
        sales."상권 구분 코드 명" AS "상권 구분 코드 명",
        sales."서비스업종 코드" AS "매출 서비스업종 코드",
        sales."서비스업종 이름" AS "매출 서비스업종 이름",
        sales."해당 분기 매출 금액" AS "해당 분기 매출 금액",
        sales."해당 분기 매출 건수" AS "해당 분기 매출 건수",
        store."점포 수" AS "점포 수",
        store."유사 업종 점포 수" AS "유사 업종 점포 수",
        store."프랜차이즈 점포 수" AS "프랜차이즈 점포 수"
      FROM sales
      LEFT JOIN store
        ON store."기준 년분기 코드" = sales."기준 년분기 코드"
      AND store."지역 수준" = sales."지역 수준"
      AND store."지역 코드" = sales."지역 코드"
      AND store."지역 이름" = sales."지역 이름"
      AND store."상권 구분 코드" = sales."상권 구분 코드"
      AND store."상권 구분 코드 명" = sales."상권 구분 코드 명"
      AND store."서비스업종 코드" = sales."서비스업종 코드"
      ORDER BY sales."해당 분기 매출 금액" DESC
      LIMIT ${limit}
    `;
    return rows;
  }

  // 14) 업종별 상권 비교(2개 상권 예시): 동일 업종의 매출/점포/유동 비교
  async compareCommercialByIndustry(params: QueryParams) {
    const { stdrYyquCd, areaCdList, categoryCode } = params;
    if (!areaCdList || areaCdList.length === 0) {
      return [];
    }

    const rows = await this.prisma.$queryRaw<unknown[]>`
      WITH
      industry_sales AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          svc_induty_cd AS "서비스업종 코드",
          svc_induty_cd_nm AS "서비스업종 이름",
          SUM(thsmon_selng_amt) AS "해당 분기 매출 금액",
          SUM(thsmon_selng_co) AS "해당 분기 매출 건수"
        FROM v_sales
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_cd IN (${Prisma.join(areaCdList)})
          AND svc_induty_cd = ${categoryCode}
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
      ),
      industry_store AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          svc_induty_cd AS "서비스업종 코드",
          SUM(stor_co) AS "점포 수"
        FROM v_store
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_cd IN (${Prisma.join(areaCdList)})
          AND svc_induty_cd = ${categoryCode}
        GROUP BY 1, 2, 3, 4, 5, 6, 7
      )
      SELECT
        industry_sales."지역 이름" AS "지역 이름",
        industry_sales."서비스업종 이름" AS "매출 서비스업종 이름",
        ft.tot_flpop_co AS "총 유동인구",
        industry_sales."해당 분기 매출 금액" AS "해당 분기 매출 금액",
        industry_sales."해당 분기 매출 건수" AS "해당 분기 매출 건수",
        industry_store."점포 수" AS "점포 수"
      FROM industry_sales
      LEFT JOIN v_foot_traffic ft
        ON ft.stdr_yyqu_cd = industry_sales."기준 년분기 코드"
      AND ft.area_level = industry_sales."지역 수준"
      AND ft.area_cd = industry_sales."지역 코드"
      AND ft.area_nm = industry_sales."지역 이름"
      AND ft.trdar_se_cd = industry_sales."상권 구분 코드"
      AND ft.trdar_se_cd_nm = industry_sales."상권 구분 코드 명"
      LEFT JOIN industry_store
        ON industry_store."기준 년분기 코드" = industry_sales."기준 년분기 코드"
      AND industry_store."지역 수준" = industry_sales."지역 수준"
      AND industry_store."지역 코드" = industry_sales."지역 코드"
      AND industry_store."지역 이름" = industry_sales."지역 이름"
      AND industry_store."상권 구분 코드" = industry_sales."상권 구분 코드"
      AND industry_store."상권 구분 코드 명" = industry_sales."상권 구분 코드 명"
      AND industry_store."서비스업종 코드" = industry_sales."서비스업종 코드"
      ORDER BY industry_sales."해당 분기 매출 금액" DESC NULLS LAST
    `;
    return rows;
  }

  // 16) 유동인구 시계열 조회 (Task 2.1)
  async getFootTrafficTimeSeries(params: QueryParams) {
    const { areaCd, limit = 8 } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      SELECT
        stdr_yyqu_cd AS "기준 년분기 코드",
        tot_flpop_co AS "총 유동인구",
        ml_flpop_co AS "남자 유동인구",
        fml_flpop_co AS "여자 유동인구"
      FROM v_foot_traffic
      WHERE area_cd = ${areaCd}
        AND area_level = 'commercial'
      ORDER BY stdr_yyqu_cd ASC
      LIMIT ${limit}
    `;
    return rows;
  }

  // 17) 유동인구 시간대/요일별 상세 조회 (Task 2.2)
  async getFootTrafficDetail(params: QueryParams) {
    const { areaCd } = params;
    const rows = await this.prisma.$queryRaw<unknown[]>`
      SELECT
        stdr_yyqu_cd AS "기준 년분기 코드",
        area_nm AS "지역 이름",
        
        -- 시간대별 유동인구
        tmzon_00_06_flpop_co AS "00~06시 유동인구",
        tmzon_06_11_flpop_co AS "06~11시 유동인구",
        tmzon_11_14_flpop_co AS "11~14시 유동인구",
        tmzon_14_17_flpop_co AS "14~17시 유동인구",
        tmzon_17_21_flpop_co AS "17~21시 유동인구",
        tmzon_21_24_flpop_co AS "21~24시 유동인구",

        -- 요일별 유동인구
        mon_flpop_co AS "월요일 유동인구",
        tues_flpop_co AS "화요일 유동인구",
        wed_flpop_co AS "수요일 유동인구",
        thur_flpop_co AS "목요일 유동인구",
        fri_flpop_co AS "금요일 유동인구",
        sat_flpop_co AS "토요일 유동인구",
        sun_flpop_co AS "일요일 유동인구"
      FROM v_foot_traffic
      WHERE area_cd = ${areaCd}
        AND area_level = 'commercial'
      ORDER BY stdr_yyqu_cd DESC
      LIMIT 1
    `;
    return rows;
  }

  // 18) 경쟁/리스크 분석 (Task 3.1)
  async getCompetitionAnalysis(params: QueryParams) {
    const { areaCd, stdrYyquCd = '20253', categoryCode } = params;

    // Prisma Model: StoreCommercial (trdar_cd 기준)
    const result = await this.prisma.storeCommercial.findFirst({
      where: {
        trdar_cd: areaCd,
        svc_induty_cd: categoryCode,
        stdr_yyqu_cd: stdrYyquCd,
      },
      select: {
        stor_co: true,
        similr_induty_stor_co: true,
        frc_stor_co: true,
        opbiz_rt: true,
        clsbiz_rt: true,
        opbiz_stor_co: true,
        clsbiz_stor_co: true,
      },
    });

    if (!result) {
      return {
        summary: '해당 상권/업종의 경쟁 분석 데이터를 찾을 수 없습니다.',
        data: null,
      };
    }

    return {
      summary: `경쟁점포 ${result.similr_induty_stor_co}개, 프랜차이즈 ${result.frc_stor_co}개, 폐업률 ${result.clsbiz_rt}% 입니다.`,
      data: {
        storeCount: Number(result.stor_co),
        competitorCount: Number(result.similr_induty_stor_co),
        franchiseCount: Number(result.frc_stor_co),
        openingRate: result.opbiz_rt,
        closingRate: result.clsbiz_rt,
        openingCount: Number(result.opbiz_stor_co),
        closingCount: Number(result.clsbiz_stor_co),
      },
      meta: {
        unit: '개/%',
        period: stdrYyquCd,
        source: 'v_store (store_commercial)',
      },
    };
  }

  // 19) 상권 장기 리스크 분석 (Task 3.1.5)
  async getCommercialRisk(params: QueryParams) {
    const { areaCd, stdrYyquCd = '20253' } = params;

    // Prisma Model: CommercialChangeCommercial (trdar_cd 기준)
    const result = await this.prisma.commercialChangeCommercial.findFirst({
      where: {
        trdar_cd: areaCd,
        stdr_yyqu_cd: stdrYyquCd,
      },
      select: {
        trdar_chnge_ix_nm: true, // 상권 등급 (상권축소, 정체, 활성화, 다이나믹)
        opr_sale_mt_avrg: true, // 평균 영업 기간
        cls_sale_mt_avrg: true, // 평균 폐업 기간
      },
    });

    if (!result) {
      return {
        summary: '해당 상권의 리스크 분석 데이터를 찾을 수 없습니다.',
        data: null,
      };
    }

    return {
      summary: `이 상권은 '${result.trdar_chnge_ix_nm}' 상태이며, 평균 영업 기간은 ${result.opr_sale_mt_avrg}개월, 폐업까지 평균 ${result.cls_sale_mt_avrg}개월이 소요됩니다.`,
      data: {
        changeIndex: result.trdar_chnge_ix_nm,
        avgOperatingMonths: result.opr_sale_mt_avrg,
        avgClosingMonths: result.cls_sale_mt_avrg,
      },
      meta: {
        unit: '개월',
        period: stdrYyquCd,
        source: 'v_commercial_change',
      },
    };
  }

  // 20) 예상 수익/비용 분석 (Task 3.2)
  async estimateRevenueAndCost(params: QueryParams) {
    const {
      areaCd,
      categoryCode,
      stdrYyquCd = '20243',
      monthlyRent,
      size = 15,
      floor = 1,
    } = params;

    // 1. 예상 매출 및 점포 수 조회 (병렬 처리)
    const [salesResult, storeResult] = await Promise.all([
      this.prisma.salesCommercial.findFirst({
        where: {
          trdar_cd: areaCd,
          svc_induty_cd: categoryCode,
          stdr_yyqu_cd: { lte: stdrYyquCd },
        },
        orderBy: { stdr_yyqu_cd: 'desc' },
        select: {
          thsmon_selng_amt: true, // 상권 전체 월 매출
        },
      }),
      this.prisma.storeCommercial.findFirst({
        where: {
          trdar_cd: areaCd,
          svc_induty_cd: categoryCode,
          stdr_yyqu_cd: { lte: stdrYyquCd },
        },
        orderBy: { stdr_yyqu_cd: 'desc' },
        select: {
          stor_co: true, // 점포 수
        },
      }),
    ]);

    if (!salesResult) {
      return {
        summary:
          '해당 상권/업종의 매출 데이터를 찾을 수 없어 수익 분석이 어렵습니다.',
        data: null,
      };
    }

    const totalRevenue = Number(salesResult.thsmon_selng_amt);
    const storeCount = storeResult ? storeResult.stor_co : 1; // 점포 수 없으면 1로 나눔 (방어)

    // 상권 전체 매출 / 점포 수 / 3개월 = 점포당 월 평균 매출 (분기 데이터이므로 3으로 나눔)
    const monthlyRevenue =
      storeCount > 0
        ? Math.floor(totalRevenue / storeCount / 3)
        : Math.floor(totalRevenue / 3);

    // 2. 임대료 계산 (Rent)
    let finalMonthlyRent = 0;
    let rentSource = '통계 추정';

    if (monthlyRent) {
      // Case A: 매물 정보 사용 (입력 단위가 만원이면 * 10000)
      finalMonthlyRent = monthlyRent * 10000;
      rentSource = '매물 정보';
    } else {
      // Case B: 통계 데이터 사용 (AreaCommercial -> Gu Name -> Rent Table)
      const areaInfo = await this.prisma.areaCommercial.findUnique({
        where: { trdar_cd: areaCd },
        select: { signgu_cd_nm: true },
      });

      if (areaInfo && areaInfo.signgu_cd_nm) {
        // 구 이름으로 임대료 테이블 조회 (여기서는 소형 점포 기준: rent_small_shop)
        // *사용자 피드백*: DB 부동산 관련 단위는 '천원'이므로, 원 단위 변환 시 * 1000
        const rentStats = await this.prisma.rent_small_shop.findUnique({
          where: { gu_name: areaInfo.signgu_cd_nm },
        });

        if (rentStats) {
          // 층별 임대료 선택 (없으면 1층 기준)
          // Prisma Decimal 타입 안전 변환
          const toNum = (val: unknown) => this.numberSafe(val) * 1000; // 천원 -> 원

          const f1 = toNum(rentStats.f1);
          const f2 = toNum(rentStats.f2);
          const b1f = toNum(rentStats.b1f);

          let rentPerPyung = 0;
          if (floor === 1) rentPerPyung = f1;
          else if (floor >= 2) rentPerPyung = f2 || f1;
          else rentPerPyung = b1f || f1;

          // 평당 임대료(원) * 평수 -> 0이면 기본값(10만원) 적용 등 방어 로직
          if (rentPerPyung === 0) rentPerPyung = 100000;

          finalMonthlyRent = rentPerPyung * size;
        }
      }
    }

    if (finalMonthlyRent === 0) {
      finalMonthlyRent = 1500000; // 최후의 기본값 (150만원)
    }

    // 3. 비용 및 순이익 계산
    // 가정: 재료비 35%, 인건비/기타 25% -> 총 변동비 60%
    const cogsRate = 0.35;
    const otherCostRate = 0.25;
    const totalCostRate = cogsRate + otherCostRate;

    const variableCost = Math.floor(monthlyRevenue * totalCostRate);
    const totalCost = variableCost + finalMonthlyRent; // 변동비 + 고정비(임대료)
    const netProfit = monthlyRevenue - totalCost;
    const profitMargin = ((netProfit / monthlyRevenue) * 100).toFixed(1);

    const formatCurrency = (amount: number) => {
      if (amount >= 100000000) {
        const uk = Math.floor(amount / 100000000);
        const man = Math.floor((amount % 100000000) / 10000);
        return `${uk}억 ${man.toLocaleString()}만원`;
      }
      return `${Math.floor(amount / 10000).toLocaleString()}만원`;
    };

    return {
      summary: `월 예상 매출은 약 ${formatCurrency(monthlyRevenue)}이며, 임대료(${formatCurrency(finalMonthlyRent)}, ${rentSource})와 비용을 제외한 추정 순수익은 약 ${formatCurrency(netProfit)}(이익률 ${profitMargin}%)입니다.`,
      data: {
        revenue: monthlyRevenue,
        rent: finalMonthlyRent,
        variableCost: variableCost,
        totalCost: totalCost,
        netProfit: netProfit,
        profitMargin: Number(profitMargin),
        rentSource: rentSource,
      },
      meta: {
        unit: '원',
        revenueType: storeCount > 1 ? '점포당 평균 매출' : '전체 매출',
        storeCount,
      },
    };
    // ... (estimateRevenueAndCost 메서드 끝)
  }
  //TODO: 수치 전면 수정 필요
  // 20) 손익분기점(BEP) 계산 (Task 4.1)
  async calcBreakEven(params: QueryParams) {
    const { areaCd, categoryCode, monthlyRent, size = 15, floor = 1 } = params;

    // 1. 임대료 계산 (Rent) - estimateRevenueAndCost와 로직 유사하므로 간단히 처리
    let finalMonthlyRent = 0;
    let rentSource = '통계 추정';

    if (monthlyRent) {
      finalMonthlyRent = monthlyRent * 10000; // 만원 단위 -> 원 단위
      rentSource = '매물 정보';
    } else {
      const areaInfo = await this.prisma.areaCommercial.findUnique({
        where: { trdar_cd: areaCd },
        select: { signgu_cd_nm: true },
      });

      if (areaInfo && areaInfo.signgu_cd_nm) {
        const rentStats = await this.prisma.rent_small_shop.findUnique({
          where: { gu_name: areaInfo.signgu_cd_nm },
        });

        if (rentStats) {
          const toNum = (val: unknown) => this.numberSafe(val) * 1000; // 천원 -> 원

          const f1 = toNum(rentStats.f1);
          const f2 = toNum(rentStats.f2);
          const b1f = toNum(rentStats.b1f);

          let rentPerPyung = 0;
          if (floor === 1) rentPerPyung = f1;
          else if (floor >= 2) rentPerPyung = f2 || f1;
          else rentPerPyung = b1f || f1;

          if (rentPerPyung === 0) rentPerPyung = 100000;
          finalMonthlyRent = rentPerPyung * size;
        }
      }
    }

    if (finalMonthlyRent === 0) finalMonthlyRent = 1500000;

    // 2. 비용 구조 가져오기
    const safeCategoryCode = categoryCode || '';
    const costStructure =
      BUSINESS_COSTS[safeCategoryCode] || BUSINESS_COSTS['default'];

    // 3. BEP 계산
    // 고정비 = 임대료 + 인건비 + 기타 고정비
    const totalFixedCost =
      finalMonthlyRent + costStructure.laborCost + costStructure.otherFixedCost;

    // 변동비율 = 원가율 + 기타 변동비율
    const totalVariableRate =
      costStructure.cogsRate + costStructure.variableRate;

    // 공헌이익률 = 1 - 변동비율
    const contributionMarginRate = 1 - totalVariableRate;

    // 손익분기 매출액 = 고정비 / 공헌이익률
    const bepRevenue =
      contributionMarginRate > 0
        ? Math.floor(totalFixedCost / contributionMarginRate)
        : 0;

    // 화폐 단위 포맷팅
    const formatCurrency = (amount: number) => {
      if (amount >= 100000000) {
        const uk = Math.floor(amount / 100000000);
        const man = Math.floor((amount % 100000000) / 10000);
        return `${uk}억 ${man.toLocaleString()}만원`;
      }
      return `${Math.floor(amount / 10000).toLocaleString()}만원`;
    };

    return {
      summary: `손익분기점(BEP)은 월 매출 약 ${formatCurrency(bepRevenue)}입니다. (고정비: ${formatCurrency(totalFixedCost)}, 변동비율: ${(totalVariableRate * 100).toFixed(0)}% 가정)`,
      data: {
        bepRevenue,
        totalFixedCost,
        rent: finalMonthlyRent,
        laborCost: costStructure.laborCost,
        otherFixedCost: costStructure.otherFixedCost,
        variableRate: totalVariableRate,
        rentSource,
      },
      meta: {
        unit: '원',
        categoryName: costStructure.categoryName,
        note: '업종별 평균 비용 구조를 가정한 추정치입니다.',
      },
    };
  }

  // 21) 생존확률 예측 (Task 4.2)
  async predictSurvivalRate(params: QueryParams) {
    const { areaCd, categoryCode, stdrYyquCd = '20243' } = params;

    // 1. 필요한 데이터 병렬 조회
    const [storeStat, changeStat] = await Promise.all([
      this.prisma.storeCommercial.findFirst({
        where: {
          trdar_cd: areaCd,
          svc_induty_cd: categoryCode,
          stdr_yyqu_cd: { lte: stdrYyquCd },
        },
        orderBy: { stdr_yyqu_cd: 'desc' },
        select: { clsbiz_rt: true, opbiz_rt: true },
      }),
      this.prisma.commercialChangeCommercial.findFirst({
        where: { trdar_cd: areaCd, stdr_yyqu_cd: { lte: stdrYyquCd } },
        orderBy: { stdr_yyqu_cd: 'desc' },
        select: {
          trdar_chnge_ix_nm: true,
          opr_sale_mt_avrg: true,
          cls_sale_mt_avrg: true,
        },
      }),
    ]);

    if (!storeStat || !changeStat) {
      return {
        summary: '생존확률 분석을 위한 충분한 데이터가 없습니다.',
        data: null,
      };
    }

    // 2. 생존 점수 계산 로직 (0 ~ 100점)
    let score = 60; // 기본 점수

    const closingRate = storeStat.clsbiz_rt; // 폐업률 (%)
    const avgOperationMonths = changeStat.opr_sale_mt_avrg; // 평균 영업 기간 (월)
    const changeStatus = changeStat.trdar_chnge_ix_nm; // 상권 등급

    // (1) 상권 등급 보정
    if (changeStatus === '상권활성화' || changeStatus === '상권확장')
      score += 15;
    else if (changeStatus === '정체') score += 5;
    else if (changeStatus === '상권축소') score -= 15;

    // (2) 폐업률 보정 (낮을수록 좋음)
    if (closingRate < 2.0)
      score += 20; // 매우 안정
    else if (closingRate < 5.0)
      score += 10; // 양호
    else if (closingRate > 10.0) score -= 20; // 위험

    // (3) 평균 영업 기간 보정 (길수록 좋음)
    if (avgOperationMonths > 60)
      score += 15; // 5년 이상
    else if (avgOperationMonths > 36)
      score += 10; // 3년 이상
    else if (avgOperationMonths < 12) score -= 10; // 1년 미만

    // 점수 클램핑 (0 ~ 99)
    score = Math.min(99, Math.max(1, score));

    // 해석 메시지 생성
    let interpretation = '보통 수준의 생존력이 예상됩니다.';
    if (score >= 80) interpretation = '생존 가능성이 매우 높습니다! 🚀';
    else if (score >= 60)
      interpretation = '비교적 안정적인 궤도 진입이 예상됩니다.';
    else if (score <= 40)
      interpretation = '초기 생존에 주의가 필요한 지역입니다. ⚠️';

    return {
      summary: `예상 생존 점수는 ${score}점입니다. ${interpretation} (폐업률: ${closingRate}%, 평균 영업: ${avgOperationMonths}개월)`,
      data: {
        score,
        interpretation,
        closingRate,
        avgOperationMonths,
        changeStatus,
      },
      meta: {
        unit: '점',
        period: stdrYyquCd,
        factors: ['폐업률', '평균영업개월', '상권변화지표'],
      },
    };
  }

  // 22) 부동산 매물 추천 (Task 4.4)
  async recommendRealEstate(params: QueryParams) {
    const {
      latitude,
      longitude,
      maxDeposit,
      maxMonthlyRent,
      minSize = 10,
      limit = 5,
    } = params;

    if (!latitude || !longitude) {
      return {
        summary:
          '중심 좌표(위도, 경도)가 없어 매물을 추천할 수 없습니다. 지도에서 위치를 선택하거나 장소를 검색해 주세요.',
        data: [],
      };
    }

    // 사용자 입력(만원) -> DB 단위(천원) 변환
    // 예: 보증금 5000만원 -> 50,000 (천원)
    const depositCondition = maxDeposit ? maxDeposit * 10 : 1000000; // 없으면 100억(무제한)
    const rentCondition = maxMonthlyRent ? maxMonthlyRent * 10 : 1000000;
    const sizeCondition = minSize; // 평수

    // 반경 1km 내 검색 (Haversine Formula)
    // 6371 * acos(...) -> km 단위
    const radiusKm = 1.0;

    // Note: Prisma raw query maps BigInt to BigInt (serialized as string or similar in logs, needs handling).
    // Also DB columns are Decimal, so cast to float for trig functions.
    // Use try-catch for safety
    try {
      const items = await this.prisma.$queryRaw<
        Array<{
          id: string;
          title: string;
          deposit: bigint;
          monthlyrent: bigint;
          size: number;
          floor: number;
          centerlatitude: number;
          centerlongitude: number;
          distance: number;
        }>
      >`
        SELECT
          id,
          title,
          deposit,
          monthlyrent,
          size,
          floor,
          centerlatitude,
          centerlongitude,
          (
            6371 * acos(
              cos(radians(${latitude})) * cos(radians(centerlatitude::float)) * cos(radians(centerlongitude::float) - radians(${longitude})) +
              sin(radians(${latitude})) * sin(radians(centerlatitude::float))
            )
          ) AS distance
        FROM real_estate_info
        WHERE deposit <= ${depositCondition}
          AND monthlyrent <= ${rentCondition}
          AND size >= ${sizeCondition}
          AND (
            6371 * acos(
              cos(radians(${latitude})) * cos(radians(centerlatitude::float)) * cos(radians(centerlongitude::float) - radians(${longitude})) +
              sin(radians(${latitude})) * sin(radians(centerlatitude::float))
            )
          ) <= ${radiusKm}
        ORDER BY distance ASC
        LIMIT ${limit}
      `;

      // BigInt 처리 및 포맷팅
      const formattedItems = items.map((item) => {
        // BigInt -> Number (천원 -> 만원 변환)
        const dep = Number(item.deposit || 0) / 10;
        const rent = Number(item.monthlyrent || 0) / 10;
        const dist = Number(item.distance || 0).toFixed(2); // km

        return {
          id: item.id,
          title: item.title || '상세 정보 없음',
          deposit: dep, // 만원
          monthlyRent: rent, // 만원
          size: Number(item.size || 0), // 평
          floor: item.floor,
          latitude: Number(item.centerlatitude),
          longitude: Number(item.centerlongitude),
          distance: dist,
        };
      });

      return {
        summary: `반경 ${radiusKm}km 이내에서 보증금 ${maxDeposit || '무제한'}만원, 월세 ${maxMonthlyRent || '무제한'}만원 이하, ${minSize}평 이상 매물 ${formattedItems.length}건을 찾았습니다.`,
        data: formattedItems,
        meta: {
          center: { lat: latitude, lng: longitude },
          radius: `${radiusKm}km`,
          count: formattedItems.length,
        },
      };
    } catch (e) {
      console.error('RealEstate Recommendation Error:', e);
      return {
        summary: '매물 데이터를 조회하는 중 오류가 발생했습니다.',
        data: [],
      };
    }
  }
  // 23) 정책자금/대출 안내 (Task 4.5)
  // Mock Data Implementation
  async getFundingPrograms(params: QueryParams) {
    try {
      // 실제로는 정부 API나 전용 DB테이블에서 조회해야 함.
      // 현재는 예시 정적 데이터 반환.
      const { areaCd, categoryCode } = params;

      // Remove unused warnings
      void areaCd;
      void categoryCode;

      const programs = [
        {
          title: '소상공인 정책자금 (성장기반자금)',
          provider: '소상공인시장진흥공단',
          description: '업력 3년 이상 소상공인 대상, 시설자금 및 운전자금 지원',
          eligibility: '업력 3년 이상 소상공인',
          limit: '최대 1억원',
          rate: '연 3%대 (변동)',
          url: 'https://www.semas.or.kr/',
        },
        {
          title: '서울신용보증재단 창업자금',
          provider: '서울신용보증재단',
          description:
            '서울시 내 창업 예정자 및 창업 6개월 이내 소상공인 대상 보증 지원',
          eligibility: '서울시 소재 창업 예정 또는 초기 창업자',
          limit: '최대 5,000만원',
          rate: '보증료 1% + 은행 금리',
          url: 'https://www.seoulshinbo.co.kr/',
        },
        {
          title: '희망리턴패키지 (재기지원)',
          provider: '중소벤처기업부',
          description:
            '폐업(예정) 소상공인의 재기 지원 (철거비, 재취업 교육 등)',
          eligibility: '폐업 예정 또는 기폐업 소상공인',
          limit: '최대 250만원 (철거비)',
          rate: '-',
          url: 'https://www.sbiz.or.kr/nhrp/main.do',
        },
      ];

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      return {
        summary: '현재 신청 가능한 주요 정책자금 및 지원 프로그램입니다.',
        data: programs,
        meta: {
          source: 'Public Data Portal (Mock)',
          updated: '2024-01',
        },
      };
    } catch (e) {
      console.error('Funding Programs Error:', e);
      return {
        summary: '정책자금 정보를 불러오는 중 오류가 발생했습니다.',
        data: [],
      };
    }
  }
  // 24) 리포트 생성 요청 (Task 4.6)
  // Action Trigger Only
  async requestReportGeneration(params: QueryParams) {
    try {
      const { title = '상권 분석 보고서' } = params;

      await new Promise((resolve) => setTimeout(resolve, 10));

      // 이 메서드는 실제 데이터를 조회하지 않고,
      // 프론트엔드가 'report.generate' 액션을 처리할 수 있도록 트리거만 제공합니다.
      return {
        summary: `요청하신 '${title}' 생성이 시작되었습니다. 잠시 후 다운로드 링크가 제공됩니다.`,
        actions: [
          {
            type: 'report.generate',
            payload: {
              title,
              // Mockup Download Link
              url: `/api/reports/download?id=mock-report-${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
          },
        ],
        data: null, // 데이터는 액션 페이로드에 포함되거나 프론트에서 처리
      };
    } catch (e) {
      console.error('Report Generation Error:', e);
      return {
        summary: '리포트 생성 요청 중 오류가 발생했습니다.',
        data: null,
      };
    }
  }
  // 25) 매물 기반 손익분기점 계산 (Task 4.7)
  async calcBreakEvenWithListing(params: QueryParams) {
    const { listingId } = params;
    // categoryCode는 params에서 optional로 처리되므로 명시적 추출 안함 (필요 시 destructuring)

    try {
      // 1. 매물 정보 조회 (raw query for convenience with snake_case mapping)
      // Note: listingId comes as string (UUID) from tool
      // const listingIdNum = Number(listingId); // DO NOT CONVERT UUID TO NUMBER

      // Prisma raw query: pass string directly.
      // If the input is not a valid UUID, PG will throw.
      // We should ideally validate it's a UUID, but for now strict passing is okay.
      const listings = await this.prisma.$queryRaw<
        Array<{
          id: string;
          monthlyrent: bigint;
          deposit: bigint;
          size: number; // Decimal in DB but mapped to number-like in raw often, check
        }>
      >`
        SELECT id, monthlyrent, deposit, size
        FROM real_estate_info
        WHERE id = ${listingId}::uuid
      `;

      if (!listings || listings.length === 0) {
        return {
          summary: '해당 매물 정보를 찾을 수 없습니다.',
          data: null,
        };
      }

      const listing = listings[0];
      // DB: 천원 단위 -> BEP 계산기: 만원 단위
      const monthlyRent = Number(listing.monthlyrent || 0) / 10;
      const deposit = Number(listing.deposit || 0) / 10;
      const size = Number(listing.size || 0);

      // 2. 기존 손익분기 계산 로직 재사용
      // (기존 calcBreakEven은 areaCd 기반이나, 여기선 매물 임대료를 직접 쓰므로
      //  areaCd가 없어도 작동하거나, areaCd가 필요하다면 매물 좌표 기반으로 역지오코딩/매칭 필요.
      //  하지만 calcBreakEven 로직을 보면 areaCd는 업종 평균 등을 위해 필요할 수 있음.
      //  여기서는 간단히 "이 매물 임대료"를 강제로 주입하여 계산.)

      // *중요*: ToolsRepository.calcBreakEven 메서드는 (params)를 받아 처리함.
      // params에 monthlyRent, deposit, size를 오버라이드해서 넘기면 됨.
      // 단, areaCd가 필수일 수 있는데, Listing에는 areaCd가 없을 수 있음.
      // -> 만약 areaCd가 필수라면, 여기서 어떻게든 구해야 함.
      // -> 일단 areaCd가 없는 경우 calcBreakEven이 어떻게 동작하는지 봐야 함.
      //    (calcBreakEven 구현을 보니 areaCd로 지역 테이블 조회하는 부분이 있음)

      // Listing의 좌표로 areaCd를 찾으면 좋겠지만, 복잡하므로
      // params에 사용자가 보고 있던 areaCd가 넘어온다고 가정하거나(컨텍스트 유지),
      // 혹은 단순히 임대료 변수만 가지고 계산 가능한지 확인.
      // (Task 4.1 구현 내용을 못 봤지만, 보통 임대료 + 업종평균비용 = BEP)

      // 편의상, 호출 시 context의 areaCd가 함께 넘어오기를 기대하거나,
      // params를 그대로 전달하면서 rent 정보만 덮어씀.
      const newParams = {
        ...params,
        monthlyRent,
        deposit,
        size,
        // floor: ... (listing.floor is string like "1층", need parsing if needed)
      };

      return this.calcBreakEven(newParams);
    } catch (e) {
      console.error('BEP with Listing Error:', e);
      return {
        summary: '매물 정보를 불러오는 중 오류가 발생했습니다.',
        data: null,
      };
    }
  }
  // Helper for safe number conversion (Private Method)
  private numberSafe(val: unknown): number {
    if (typeof val === 'bigint') return Number(val);
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val);

    // Handle Decimal-like objects (e.g., from Prisma)
    if (val && typeof val === 'object' && 'toNumber' in val) {
      return (val as { toNumber: () => number }).toNumber();
    }
    return Number(val || 0);
  }
}
