// =========================================
// AI Assistant 응답 스키마 (Structured Outputs)
// 프론트엔드 assistant-types.ts와 동기화 필요
// =========================================

export const FINAL_RESPONSE_SCHEMA_FOR_ACTION = {
  type: 'json_schema',
  name: 'final_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      reply: {
        type: 'string',
        description: '사용자에게 보여줄 답변 (Markdown 형식)',
      },
      actions: {
        type: 'array',
        description: 'UI 제어 명령 배열',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: [
                // 기존 액션
                'map.pan_to', // 지도 이동
                'ui.open_panel', // 분석 패널 열기
                'map.highlight', // 폴리곤 하이라이트
                // 새 액션 (6개)
                'ranking.show', // 매출 랭킹 표시
                'population.filter', // 유동인구 필터
                'compare.areas', // 상권 비교
                'rent.calculate', // 임대료 계산
                'report.generate', // 리포트 생성
              ],
              description: '실행할 액션 유형',
            },
            payload: {
              type: 'object',
              description: '액션에 필요한 파라미터 (사용하지 않는 값은 null)',
              properties: {
                // 기존 필드
                lat: { type: ['number', 'null'] },
                lng: { type: ['number', 'null'] },
                zoom: { type: ['number', 'null'] },
                panelType: { type: ['string', 'null'] },
                level: {
                  type: ['string', 'null'],
                  enum: ['gu', 'dong', 'commercial', null],
                },
                areaCode: { type: ['string', 'null'] },
                areaName: { type: ['string', 'null'] },
                color: { type: ['string', 'null'] },
                // 새 필드 (ranking.show)
                industryCode: { type: ['string', 'null'] },
                // 새 필드 (population.filter)
                genderFilter: {
                  type: ['string', 'null'],
                  enum: ['Male', 'Female', 'Total', null],
                },
                ageFilter: { type: ['string', 'null'] },
                timeFilter: { type: ['string', 'null'] },
                // 새 필드 (compare.areas)
                compareTargets: {
                  type: ['object', 'null'],
                  properties: {
                    codeA: { type: 'string' },
                    codeB: { type: 'string' },
                    nameA: { type: ['string', 'null'] },
                    nameB: { type: ['string', 'null'] },
                  },
                  required: ['codeA', 'codeB', 'nameA', 'nameB'],
                  additionalProperties: false,
                },
                // 새 필드 (rent.calculate)
                rentParams: {
                  type: ['object', 'null'],
                  properties: {
                    area: { type: 'number' },
                    deposit: { type: 'number' },
                    rent: { type: 'number' },
                  },
                  required: ['area', 'deposit', 'rent'],
                  additionalProperties: false,
                },
              },
              required: [
                'lat',
                'lng',
                'zoom',
                'panelType',
                'level',
                'areaCode',
                'areaName',
                'color',
                'industryCode',
                'genderFilter',
                'ageFilter',
                'timeFilter',
                'compareTargets',
                'rentParams',
              ],
              additionalProperties: false,
            },
          },
          required: ['type', 'payload'],
          additionalProperties: false,
        },
      },
    },
    required: ['reply', 'actions'],
    additionalProperties: false,
  },
} as const;
