import OpenAI from 'openai';
import { AreaVectorDto, BusinessCategoryVectorDto } from '../dto/column-vector';
import { ResponseInput, Tool } from 'openai/resources/responses/responses.js';
import { tools } from './tools';
import { FINAL_RESPONSE_SCHEMA_FOR_ACTION } from './schemas';

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
    tools: tools as Array<Tool>,
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
            당신은 상권분석 전문가 입니다.
            사용자의 질의에 맞게 응답을 생성해 주세요.
            도구 호출 결과를 참고하여 최종 응답을 생성해 주세요.

            [Action 가이드]
            - 특정 지역을 언급하면 'actions' 배열에 'map.pan_to' 액션을 추가하세요.
              줌 레벨은 무조건 3로 하세요.
              예: { "type": "map.pan_to", "payload": { "lat": 37.5, "lng": 127.0, "zoom": 3 } }
            - 분석 결과를 보여줄 때는 'ui.open_panel' 액션을 추가하세요.
              이때 'level' (gu, dong, commercial 중 하나), 'lat', 'lng', 'areaName'을 반드시 포함하세요.
              예: { "type": "ui.open_panel", "payload": { "panelType": "summary", "level": "gu", "lat": 37.5, "lng": 127.0, "areaName": "강남구" } }
            - 액션이 필요없는 경우 빈 배열 []을 반환하세요.
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
