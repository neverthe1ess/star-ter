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
                'population.filter', // 유동인구 필터 (deprecated 예정, map.setLayer 권장)
                'compare.areas', // 상권 비교
                'rent.calculate', // 임대료 계산
                'report.generate', // 리포트 생성
                'real_estate.recommend', // 매물 추천
                // 신규 추가 (Phase 1)
                'map.setLayer', // 레이어 토글 (히트맵 등)
                'map.setMarkers', // 마커 표시
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
                // 새 필드 (real_estate.recommend)
                maxDeposit: { type: ['number', 'null'] },
                maxMonthlyRent: { type: ['number', 'null'] },
                minSize: { type: ['number', 'null'] },
                keywords: { type: ['string', 'null'] },
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
              ],
              additionalProperties: false,
            },
          },
          required: ['type', 'payload'],
          additionalProperties: false,
        },
      },
      // =========================================
      // artifacts: LLM이 생성하는 시각화 데이터
      // =========================================
      artifacts: {
        type: 'array',
        description: '차트/테이블 등 시각화 데이터 배열 (선택사항)',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '고유 ID (uuid 형태 권장)',
            },
            kind: {
              type: 'string',
              enum: ['chart', 'table', 'gauge', 'checklist', 'comparison_card'],
              description: '아티팩트 유형',
            },
            title: {
              type: 'string',
              description: '차트/테이블 제목',
            },
            spec: {
              type: 'object',
              description: '차트/테이블 스펙',
              properties: {
                // chart 전용
                chartType: {
                  type: ['string', 'null'],
                  enum: ['line', 'bar', 'pie', 'radar', 'waterfall', null],
                },
                // 데이터 포인트 (간단한 배열로 제한)
                data: {
                  type: 'array',
                  description: '데이터 포인트 배열 (최대 10개 권장)',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'number' },
                    },
                    required: ['label', 'value'],
                    additionalProperties: false,
                  },
                },
                // gauge 전용
                current: { type: ['number', 'null'] },
                max: { type: ['number', 'null'] },
                threshold: { type: ['number', 'null'] },
                // table 전용
                columns: {
                  type: ['array', 'null'],
                  items: { type: 'string' },
                },
                rows: {
                  type: ['array', 'null'],
                  items: {
                    type: 'array',
                    items: { type: ['string', 'number', 'null'] },
                  },
                },
              },
              required: [
                'chartType',
                'data',
                'current',
                'max',
                'threshold',
                'columns',
                'rows',
              ],
              additionalProperties: false,
            },
          },
          required: ['id', 'kind', 'title', 'spec'],
          additionalProperties: false,
        },
      },
      // =========================================
      // suggestedPrompts: 다음 질문 제안
      // =========================================
      suggestedPrompts: {
        type: 'array',
        description: '사용자에게 제안할 다음 질문 (최대 3개)',
        items: { type: 'string' },
      },
    },
    required: ['reply', 'actions', 'artifacts', 'suggestedPrompts'],
    additionalProperties: false,
  },
} as const;
