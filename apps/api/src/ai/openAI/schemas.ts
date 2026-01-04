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
              enum: ['map.pan_to', 'ui.open_panel', 'map.highlight'],
              description: '실행할 액션 유형',
            },
            payload: {
              type: 'object',
              description: '액션에 필요한 파라미터 (사용하지 않는 값은 null)',
              properties: {
                lat: { type: ['number', 'null'] },
                lng: { type: ['number', 'null'] },
                zoom: { type: ['number', 'null'] },
                panelType: { type: ['string', 'null'] },
                areaCode: { type: ['string', 'null'] },
                areaName: { type: ['string', 'null'] },
                color: { type: ['string', 'null'] },
              },
              required: [
                'lat',
                'lng',
                'zoom',
                'panelType',
                'areaCode',
                'areaName',
                'color',
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
