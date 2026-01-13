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
                // 지도 액션
                'map.pan_to',
                'map.highlight',
                'map.setLayer',
                'map.setMarkers',
                // UI 액션
                'ui.open_panel',
                // 차트 액션 (신규)
                'chart.revenue', // 매출 분석 차트
                'chart.survival', // 생존 점수 게이지
                'chart.competition', // 경쟁 분석 차트
                'chart.breakeven', // 손익분기 분석
                // 리스트 액션 (신규)
                'list.listings', // 매물 리스트
                'list.similar_areas', // 유사 상권 리스트
                // 기존 액션
                'ranking.show',
                'compare.areas',
                'rent.calculate',
                'report.generate',
                'real_estate.recommend',
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
                // map.setLayer 전용
                layer: {
                  type: ['string', 'null'],
                  enum: ['footTraffic', 'sales', null],
                },
                visible: { type: ['boolean', 'null'] },
                // map.setMarkers 전용
                markers: {
                  type: ['array', 'null'],
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: ['string', 'null'] },
                      lat: { type: 'number' },
                      lng: { type: 'number' },
                      label: { type: ['string', 'null'] },
                      type: {
                        type: ['string', 'null'],
                        enum: ['competitor', 'listing', 'default', null],
                      },
                    },
                    required: ['id', 'lat', 'lng', 'label', 'type'],
                    additionalProperties: false,
                  },
                },
                // 업종/필터 필드
                industryCode: { type: ['string', 'null'] },
                genderFilter: {
                  type: ['string', 'null'],
                  enum: ['Male', 'Female', 'Total', null],
                },
                ageFilter: { type: ['string', 'null'] },
                timeFilter: { type: ['string', 'null'] },
                // 비교 필드
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
                // 임대료 필드
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
                // 매물 추천 필드
                maxDeposit: { type: ['number', 'null'] },
                maxMonthlyRent: { type: ['number', 'null'] },
                minSize: { type: ['number', 'null'] },
                keywords: { type: ['string', 'null'] },
                // 매물 ID (손익분기 계산용)
                listingId: { type: ['string', 'null'] },
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
                'maxDeposit',
                'maxMonthlyRent',
                'minSize',
                'keywords',
                'layer',
                'visible',
                'markers',
                'listingId',
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
