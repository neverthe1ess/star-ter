# plan.md — 상권 분석 서비스 LLM UI/지도 인터랙션 (Hybrid Approach)

## 0) 목표

- 사용자가 자연어로 요청하면 LLM이 **백엔드에서 데이터 조회(Function Calling)** 를 수행한 뒤,
- 모든 분석이 끝난 후 **최종 응답(JSON)** 에 `actions` 필드를 포함하여 프론트엔드로 전달한다.
- 프론트(Executor)는 이 `actions`를 순차적으로 실행하여 지도 이동, 하이라이트 등 UI 조작을 수행한다.

## 1) 핵심 원칙 (Hybrid Approach)

- **Function Calling (1단계)**: 도구(Tool) 호출은 백엔드 내부의 데이터 조회(`get_store` 등)에만 사용한다. (이미 구현됨)
- **text.format (2단계)**: 최종 응답 생성 시 `response.text.format`으로 JSON Schema를 강제하여 `reply` + `actions` 구조를 보장한다.

---

## 2) MVP에서 제공할 인터랙션

### P0 (필수)

- **상권 스냅샷**: 지역 입력 → 지도 이동 (`map.pan_to`) + 요약 패널 열기 (`ui.open_panel`)
- **비교 모드**: A vs B 비교 → 두 지역이 다 보이게 줌 아웃 (`map.fit_bounds`) + 비교 패널 열기
- **하이라이트**: 특정 데이터를 언급하며 지도상 위치 강조 (`map.highlight`)

---

## 3) 액션 카탈로그 (JSON Schema)

> 최종 응답의 `actions` 배열에 들어갈 수 있는 명령어 목록

### Map Actions

- `map.pan_to`: 특정 좌표로 이동 (lat, lng, zoom?)
- `map.fit_bounds`: 여러 영역이 한 번에 보이도록 뷰 조정
- `map.highlight`: 특정 영역 강조 (areaCode, color)

### UI Actions

- `ui.open_panel`: 사이드바/비교 패널 열기 (panelType: 'summary' | 'comparison')
- `ui.show_toast`: 간단한 알림 띄우기

---

## 4) 시스템 아키텍처

### 4.1 Backend (`apps/api/src/ai`)

- **Target Files**:
  - `apps/api/src/ai/openAI/openAI.ts` - `analyzeResults` 수정
  - `apps/api/src/ai/ai.service.ts` - JSON 반환 로직

- **Flow**:
  1. `toolCallAi(message)`: 사용자 질문 분석 → 데이터 조회 Function Calling (이미 구현됨)
  2. `analyzeResults(input)`: Tool 실행 결과를 포함하여 최종 응답 생성
  3. **text.format 적용**: `analyzeResults`에서 `text.format`으로 JSON Schema 강제

### 4.2 Frontend (`apps/web`)

- **기존 Chat UI 재사용**: `AIChatSidebar.tsx`
- **Action Executor**: `actions` 배열을 받아 `Zustand Store` 조작
- **API Repository**: 백엔드 `/ai/message` 호출 및 JSON 파싱

---

## 5) 백엔드 구현 상세 (`apps/api/src/ai/openAI/openAI.ts`)

### text.format Schema 적용 (analyzeResults 수정)

```typescript
// responses.create 호출 시 text.format 추가
text: {
  format: {
    type: 'json_schema',
    name: 'final_response',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        reply: { type: 'string', description: '사용자 답변 (Markdown)' },
        actions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['map.pan_to', 'ui.open_panel', 'map.highlight'] },
              payload: { type: 'object', additionalProperties: true }
            },
            required: ['type', 'payload'],
            additionalProperties: false
          }
        }
      },
      required: ['reply', 'actions'],
      additionalProperties: false
    }
  }
}
```

---

## 6) 구현 순서 (체크리스트)

### Phase 1: 백엔드 수정 (`apps/api/src/ai`)

- [ ] `openAI/openAI.ts`: `analyzeResults` 함수에 `text.format` JSON Schema 적용
- [ ] `ai.service.ts`: `analyzeResults` 결과에서 `output_text` (JSON 문자열) 반환

### Phase 2: 프론트엔드 Executor 구현 (`apps/web`)

- [ ] `types/actions.ts`: ClientAction 타입 정의
- [ ] `services/action-executor.ts`: ActionExecutor 서비스 (Zustand 연동)
- [ ] `services/chat/chat.repository.api.ts`: 백엔드 `/ai/message` 호출 및 JSON 파싱
- [ ] `services/chat/types.ts`: ChatMessage에 actions 필드 추가
- [ ] `services/chat/chat.service.ts`: ApiChatRepository 활성화
- [ ] `components/features/chat/AIChatSidebar.tsx`: ActionExecutor 연동

### Phase 3: 통합 테스트

- [ ] "강남구 분석해줘" 시나리오 테스트 (지도 이동 + 패널 열림)

---

## 7) 리스크 & 고려사항

- **지원 모델**: `text.format`은 `gpt-4o-2024-08-06` 이상에서만 지원됨
- **Action Payload Validation**: 백엔드 `action.payload`가 프론트 `store` 메서드 인자와 정확히 일치해야 함
