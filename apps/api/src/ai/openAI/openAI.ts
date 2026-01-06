import OpenAI from 'openai';
import { AreaVectorDto, BusinessCategoryVectorDto } from '../dto/column-vector';
import { ResponseInput, Tool } from 'openai/resources/responses/responses.js';
import { TOOLS } from './constant/tools';
import { FINAL_RESPONSE_SCHEMA_FOR_ACTION } from './constant/schemas';
import { RECOMMEND_TABLES } from './constant/tables';

// Singleton OpenAI client
class OpenAIClient {
  private static client: OpenAI;
  static getClient() {
    if (!this.client) {
      this.client = new OpenAI();
    }
    return this.client;
  }
}

export function getText(response: OpenAI.Responses.Response) {
  return response?.output_text || '';
}

export function embedText(text: string) {
  return OpenAIClient.getClient().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
}

export function getCategoryByMessage(message: string) {
  return OpenAIClient.getClient().responses.create({
    model: 'gpt-4.1-mini',
    input: message,
    temperature: 0,
    instructions: `
            사용자 질의에 있는 업종을 분석하여 뽑아주세요 여러 업종이 있을 경우 ,로 구분하여 나열해주세요
            업종이 없을 경우 "" 빈문자열을 반환해주세요
            ex) "홍대에서 잘나가는 업종 알려줘" -> ""
            ex) "서울시 강남구에서 음식점과 카페 매출 알려줘" -> "음식점, 카페"
            ex) "한식 음식점이 잘 팔리는 상권은 어디야?" -> "한식 음식점"
            ex) "한식과 일식 매출 비교해줘" -> "한식, 일식"
    `,
  });
}

export function getLocationByMessage(message: string) {
  return OpenAIClient.getClient().responses.create({
    model: 'gpt-4.1-mini',
    input: message,
    temperature: 0,
    instructions: `
            사용자 질의에 있는 위치 정보를 분석하여 뽑아주세요 여러 위치가 있을 경우 ,로 구분하여 나열해주세요
            위치 정보 단계는 [시, 자치구, 행정동, 상권]이 있습니다. 문맥을 파악하여 적절한 단계로 뽑아주세요
            위치 정보가 없을 경우 빈문자열을 반환해주세요
            ex) "홍대에서 잘나가는 업종 알려줘" -> "홍대"
            ex) "강남구에서 음식점과 카페 매출 알려줘" -> "서울시, 강남구"
            ex) "서울대입구역 8번 출구 근처 상권이 궁금해" -> "서울대입구역 8번"
    `,
  });
}

export function toolCallAi(
  message: string,
  categories: BusinessCategoryVectorDto[],
  areaList: AreaVectorDto[],
) {
  return OpenAIClient.getClient().responses.create({
    model: 'gpt-4.1-mini',
    temperature: 0,
    input: message,
    tools: TOOLS as Array<Tool>,
    instructions: `
            당신은 상권분석 전문가 입니다.
            사용자의 질의에 맞게 도구를 호출해 주세요.
            필요한 경우에만 도구를 호출하고, 도구를 호출하지 않아도 되는 경우에는 호출하지 마세요.
            도구를 호출할 때는 반드시 업종 코드(svc_induty_cd)와 지역 코드(area_cd)를 참고하여 호출해 주세요.

            업종 코드와 이름 같은경우 아래 값을 참고하세요.
            ${formatCategoryVectors(categories)}

            지역 코드와 이름 같은경우 아래 값을 참고하세요.
            ${formatAreaVectors(areaList)}
            `,
  });
}

export function analyzeResults(input: ResponseInput) {
  return OpenAIClient.getClient().responses.create({
    model: 'gpt-4.1-mini',
    input: input,
    temperature: 0.1,
    text: {
      format: FINAL_RESPONSE_SCHEMA_FOR_ACTION,
    },
    instructions: `
당신은 상권분석 전문가 AI 어시스턴트입니다.
사용자의 질의에 맞게 응답을 생성하고, 적절한 UI 액션을 선택하세요.
도구 호출 결과를 참고하여 최종 응답을 생성해 주세요.

[사용 가능한 액션 타입]

1. map.pan_to - 지도를 특정 위치로 이동
   - 사용 시점: 특정 지역/상권을 언급할 때
   - 필수: lat, lng, zoom(항상 3), areaName
   - 예: "강남역 상권 보여줘" → map.pan_to

2. ui.open_panel - 분석 패널 열기
   - 사용 시점: 상세 분석 결과를 보여줄 때
   - 필수: level(gu/dong/commercial), lat, lng, areaName, panelType(summary)
   - 예: "강남구 분석해줘" → ui.open_panel

3. ranking.show - 매출 랭킹 표시
   - 사용 시점: 순위, TOP N, 매출 높은/낮은 상권 질문 시
   - 필수: level(gu/dong/commercial)
   - 선택: industryCode (업종 필터)
   - 예: "매출 높은 상권 TOP5 알려줘" → ranking.show

4. population.filter - 유동인구 필터
   - 사용 시점: 유동인구, 방문객, 시간대별 인구 질문 시
   - 선택: genderFilter(Male/Female/Total), ageFilter, timeFilter
   - 예: "20대 여성이 많이 오는 시간대는?" → population.filter

5. compare.areas - 상권 비교
   - 사용 시점: 두 상권을 비교해달라는 요청 시
   - 필수: compareTargets { codeA, codeB, nameA, nameB }
   - 예: "홍대 vs 이태원 비교해줘" → compare.areas

6. rent.calculate - 임대료 분석
   - 사용 시점: 임대료, 수익성, 창업비용 관련 질문 시
   - 선택: rentParams { area, deposit, rent }
   - 예: "이 상권에서 가게 열면 수익률이 어때?" → rent.calculate

7. report.generate - 리포트 생성
   - 사용 시점: 보고서, 리포트, 요약 문서 요청 시
   - 필수: areaName
   - 예: "강남역 상권 리포트 만들어줘" → report.generate

[규칙]
- 액션이 필요없는 일반 대화는 빈 배열 []
- 가장 적합한 액션 1개만 선택
- 사용하지 않는 payload 필드는 null로 설정
`,
  });
}

export function getTablesByMessage(message: string) {
  return OpenAIClient.getClient().responses.create({
    model: 'gpt-4.1-mini',
    temperature: 0,
    input: message,
    instructions: `
            #context
            당신은 상권분석 전문가 입니다.
            사용자의 질의에 어울리는 지역(area_cd)을 추천해주기 위해
            어울리는 테이블 세개를 아래에서 골라 주세요.
            ','로 구분하여 나열해 주세요. 
            지역을 추천할 수 없는 질의인 경우 빈문자열을 반환해 주세요.
    
            #예시
            ex) "한식이 잘나가는 상권 알려줘" -> v_sales, v_foot_traffic, v_commercial_change
            ex) "카페 매출이 높은 지역 추천해줘" -> v_sales, v_income_consumption, v_foot_traffic
            ex) "아무말" -> ""

            사용 가능한 테이블은 아래와 같습니다.
            v_commercial_change: 상권변화지표
            v_foot_traffic: 유동인구
            v_income_consumption: 소득소비지표
            v_resident_population: 상주인구
            v_sales: 매출
            v_working_population: 직장인구
            `,
  });
}

export function getRecommendCommercialAreasQuery(
  message: string,
  categories: BusinessCategoryVectorDto[],
  areaList: AreaVectorDto[],
  tables: string[],
) {
  return OpenAIClient.getClient().responses.create({
    model: 'gpt-4.1-mini',
    temperature: 0,
    input: message,
    instructions: `
            #context
            사용자의 질의에 어울리는 지역(area_cd)을 3개 이하로 추천해주는 PostgreSQL 쿼리를 작성해주세요.
            매출이 높은곳, 해당 업종에 어울리는 유동인구가 많은 곳, 해당 업종에 어울리는 상주인구가 많은곳 등
            다양하고 간단한 관점에서 각 하나씩 뽑아 중복되지 않는 총 세개 이하를 추천해주세요.
            별칭으로 해당 지역이 어떤 관점에서 추천되었는지 추천 사유와 추천 사유에 맞는 재치있는 설명을 함께 반환해주세요.
  
            ex) '해당 업종 매출 상위 지역', '남성 유동인구 상위 지역', '청년 상주인구 상위 지역', '여성 직장인구 상위 지역', '폐업률 낮은 지역' 등
            
            #쿼리문 작성
            지역레벨(시/자치구/행정동/상권)에 대한 언급이 없을 경우 area_level는 commercial로 해주세요
            시점에 대한 얘기가 없을 경우 stdr_yyqu_cd는 20253으로 해주세요.
            area_cd를 select할때 테이블.area_cd 형식으로 작성해주세요.
            
            출력문에는 SQL 쿼리문만 작성해주세요. 부가 설명이나 다른 텍스트는 포함하지 마세요.
            sql을 구분짓기 위한 표기도 하지마세요 오직 쿼리문만 출력하세요.

            #참고자료
            업종 코드와 이름 같은경우 아래 값을 참고하세요.
            ${formatCategoryVectors(categories)}

            지역 코드와 이름 같은경우 아래 값을 참고하세요.
            ${formatAreaVectors(areaList)}

            데이터 베이스 정보는 아래와 같습니다.
            ${formatTableList(tables)}

            #최종 출력 예시
            with sales_rank as (select area_cd,
                                  area_nm,
                                  area_level,
                                  thsmon_selng_amt
                          from v_sales
                          where svc_induty_cd = 'CS100008'
                            and stdr_yyqu_cd = '20253'
                            and area_level = 'commercial'
                          order by thsmon_selng_amt desc
                          limit 1),
            foot_traffic_rank as (select area_cd,
                                        area_nm,
                                        area_level,
                                        tot_flpop_co
                                  from v_foot_traffic
                                  where stdr_yyqu_cd = '20253'
                                    and area_level = 'commercial'
                                  order by tot_flpop_co desc),
            residential_population as (select area_cd,
                                              area_nm,
                                              area_level,
                                              agrde_20_flpop_co + agrde_30_flpop_co as young_population
                                      from v_foot_traffic
                                      where stdr_yyqu_cd = '20253'
                                        and area_level = 'commercial'
                                      order by young_population desc
                                      limit 1)
            select area_cd, area_level, area_nm, '해당 업종 매출 상위 지역' as recommend_title, '분식집이 잘나가는 곳!' as recommend_reason
            from sales_rank
            union all
            select area_cd, area_level, area_nm, '유동인구 상위 지역' as recommend_title, '사람들이 많이 모이는 활기찬 상권!' as recommend_reason
            from foot_traffic_rank
            union all
            select area_cd, area_level, area_nm, '청년 유동인구 상위 지역' as recommend_title, '젊은이들이 즐겨 찾는 핫플레이스!' as recommend_reason
            from residential_population
            `,
  });
}

function formatAreaVectors(areas: AreaVectorDto[]): string {
  return areas
    .map(
      (area) =>
        `area_name: ${area.areaName}, area_level: ${area.areaLevel}, area_code: ${area.areaCode}`,
    )
    .join('\n');
}

function formatCategoryVectors(
  categories: BusinessCategoryVectorDto[],
): string {
  return categories
    .map(
      (cat) =>
        `svc_induty_cd: ${cat.code}, svc_induty_cd_nm: ${cat.categoryName}`,
    )
    .join('\n');
}

function formatTableList(tables: string[]): string {
  let result = '';
  for (const table of tables) {
    if (RECOMMEND_TABLES[table]) {
      result += `${table}: ${RECOMMEND_TABLES[table]}\n`;
    }
  }
  return result;
}

export function getMarketSummary(areaName: string, metrics: string) {
  return OpenAIClient.getClient().responses.create({
    model: 'gpt-5-nano',
    reasoning: {
      effort: 'minimal',
    },
    input: `지역: ${areaName}\n데이터:\n${metrics}`,
    instructions: `
            당신은 상권분석 전문가입니다.
            주어진 상권 데이터(업종 현황, 매출 추이, 유동인구 특징 등)를 바탕으로 이 상권의 핵심 특징과 현황을 3줄 이내로 명확하게 요약해주세요.
            사용자가 한눈에 상권의 분위기를 파악할 수 있도록 핵심만 짚어서 설명하세요.
            전문 용어는 사용하지 말고, 없는 정보는 언급하지 마세요.
            말투는 "~해요" 체로 친근하지만 전문적으로 작성해주세요.
            `,
  });
}
