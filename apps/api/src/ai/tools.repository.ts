import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryParams } from './dto/query-dto';

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

  // 10) 상권 비교(2개 상권 예시): 유동인구/매출 합계 비교
  async compareCommercialAreas(params: QueryParams) {
    const { stdrYyquCd, areaCdList } = params;
    // areaCdList가 없거나 빈 배열이면 빈 결과 반환
    if (!areaCdList || areaCdList.length === 0) {
      return [];
    }

    const rows = await this.prisma.$queryRaw<unknown[]>`
      WITH
      ft AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          tot_flpop_co AS "총 유동인구"
        FROM v_foot_traffic
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_cd IN (${Prisma.join(areaCdList)})
      ),
      sales AS (
        SELECT
          stdr_yyqu_cd AS "기준 년분기 코드",
          area_level AS "지역 수준",
          area_cd AS "지역 코드",
          area_nm AS "지역 이름",
          trdar_se_cd AS "상권 구분 코드",
          trdar_se_cd_nm AS "상권 구분 코드 명",
          SUM(thsmon_selng_amt) AS "해당 분기 매출 금액"
        FROM v_sales
        WHERE stdr_yyqu_cd = ${stdrYyquCd}
          AND area_cd IN (${Prisma.join(areaCdList)})
        GROUP BY 1, 2, 3, 4, 5, 6
      )
      SELECT
        ft."지역 이름" AS "지역 이름",
        ft."총 유동인구" AS "총 유동인구",
        sales."해당 분기 매출 금액" AS "해당 분기 매출 금액"
      FROM ft
      LEFT JOIN sales
        ON sales."기준 년분기 코드" = ft."기준 년분기 코드"
      AND sales."지역 수준" = ft."지역 수준"
      AND sales."지역 코드" = ft."지역 코드"
      AND sales."지역 이름" = ft."지역 이름"
      AND sales."상권 구분 코드" = ft."상권 구분 코드"
      AND sales."상권 구분 코드 명" = ft."상권 구분 코드 명"
      ORDER BY sales."해당 분기 매출 금액" DESC NULLS LAST
    `;
    return rows;
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
  // 15) 부동산 매물 추천 (AI 파라미터 추출용)
  async getRecommendRealEstate(params: QueryParams) {
    return Promise.resolve({
      status: 'success',
      message: 'Real estate recommendation parameters extracted.',
      params: {
        maxDeposit: params.maxDeposit,
        maxMonthlyRent: params.maxMonthlyRent,
        minSize: params.minSize,
        keywords: params.keywords,
      },
    });
  }
}
