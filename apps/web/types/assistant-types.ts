// =========================================
// AI Assistant 전용 타입 정의
// 6개 새 기능 확장을 위한 확장 가능한 구조
// =========================================

// -----------------------------------------
// 백엔드 액션 타입 (LLM이 반환하는 형태)
// schemas.ts의 FINAL_RESPONSE_SCHEMA_FOR_ACTION과 동기화
// -----------------------------------------
export type BackendActionType =
  | 'map.pan_to' // 지도 이동
  | 'ui.open_panel' // 분석 패널 열기
  | 'map.highlight' // 폴리곤 하이라이트
  // 새 기능 (Phase 3에서 추가)
  | 'ranking.show' // 매출 랭킹
  | 'population.filter' // 유동인구 필터
  | 'compare.areas' // 상권 비교
  | 'rent.calculate' // 임대료 계산
  | 'report.generate'; // 리포트 생성

// -----------------------------------------
// 프론트엔드 액션 타입 (UI가 처리하는 형태)
// AssistantMapSection에서 핸들러로 매핑
// -----------------------------------------
export type FrontendActionType =
  | 'showMarker' // 마커 표시 + 지도 이동
  | 'highlightPolygon' // 폴리곤 하이라이트
  | 'compare' // 상권 비교
  // 새 기능 (Phase 3에서 추가)
  | 'showRanking' // 매출 랭킹 표시
  | 'filterPopulation' // 유동인구 레이어 필터
  | 'openAnalysisPanel' // 분석 패널 열기
  | 'calculateRent' // 임대료 계산
  | 'generateReport'; // 리포트 생성

// -----------------------------------------
// 액션 페이로드 (모든 액션이 공유하는 데이터)
// 각 액션은 필요한 필드만 사용
// -----------------------------------------
export interface ActionPayload {
  // 기본 위치 정보
  lat?: number;
  lng?: number;
  zoom?: number;

  // 지역 정보
  areaCode?: string;
  areaName?: string;
  level?: 'gu' | 'dong' | 'commercial';

  // 기존 MapAction 호환
  code?: string;
  codes?: string[];
  coordinates?: [number, number];
  name?: string;

  // 새 기능용 필드 (Phase 3)
  industryCode?: string;
  genderFilter?: 'Male' | 'Female' | 'Total';
  ageFilter?: string;
  timeFilter?: string;
  compareTargets?: {
    codeA: string;
    codeB: string;
    nameA?: string;
    nameB?: string;
  };
  rentParams?: { area: number; deposit: number; rent: number };
}

// -----------------------------------------
// 프론트엔드용 통합 액션
// AssistantLayout에서 상태로 관리
// -----------------------------------------
export interface AssistantAction {
  type: FrontendActionType;
  payload: ActionPayload;
}

// -----------------------------------------
// 채팅 메시지 타입
// -----------------------------------------
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: AssistantAction;
  // 카드형 컨텐츠 (체크리스트, 버튼 등)
  card?: {
    title: string;
    items?: string[];
    buttonText?: string;
    buttonAction?: string;
  };
}

// -----------------------------------------
// 백엔드 응답 타입 (ai.controller.ts 응답)
// -----------------------------------------
export interface BackendAction {
  type: BackendActionType;
  payload: ActionPayload;
}

export interface ChatResponse {
  reply: string;
  actions: BackendAction[];
}
