// =========================================
// 백엔드 액션 → 프론트엔드 액션 변환 유틸리티
// AssistantChat.tsx에서 사용
// =========================================

import type {
  BackendActionType,
  FrontendActionType,
  AssistantAction,
  ActionPayload,
} from '@/types/assistant-types';

// -----------------------------------------
// 백엔드 → 프론트엔드 액션 타입 매핑
// 새 액션 추가 시 여기만 수정하면 됨
// -----------------------------------------
const ACTION_TYPE_MAP: Record<BackendActionType, FrontendActionType> = {
  // 기존 액션
  'map.pan_to': 'showMarker',
  'ui.open_panel': 'openAnalysisPanel',
  'map.highlight': 'highlightPolygon',
  // 새 기능 (Phase 3)
  'ranking.show': 'showRanking',
  'population.filter': 'filterPopulation',
  'compare.areas': 'compare',
  'rent.calculate': 'calculateRent',
  'report.generate': 'generateReport',
  'real_estate.recommend': 'recommendRealEstate',
};

// -----------------------------------------
// 백엔드 액션을 프론트엔드 액션으로 변환
// -----------------------------------------
export function mapBackendAction(
  backendType: string,
  backendPayload: Record<string, unknown>,
): AssistantAction | null {
  const frontendType = ACTION_TYPE_MAP[backendType as BackendActionType];

  if (!frontendType) {
    console.warn(`Unknown backend action type: ${backendType}`);
    return null;
  }

  // 페이로드 정규화 (백엔드 필드 → 프론트엔드 필드)
  const payload: ActionPayload = {
    // 기존 필드
    lat: backendPayload.lat as number | undefined,
    lng: backendPayload.lng as number | undefined,
    zoom: backendPayload.zoom as number | undefined,
    areaCode: backendPayload.areaCode as string | undefined,
    areaName: backendPayload.areaName as string | undefined,
    level: backendPayload.level as 'gu' | 'dong' | 'commercial' | undefined,
    // 호환성: coordinates 변환
    coordinates:
      backendPayload.lat && backendPayload.lng
        ? [backendPayload.lat as number, backendPayload.lng as number]
        : undefined,
    name: backendPayload.areaName as string | undefined,
    code: backendPayload.areaCode as string | undefined,

    // 새 필드 (ranking.show)
    industryCode: backendPayload.industryCode as string | undefined,

    // 새 필드 (population.filter)
    genderFilter: backendPayload.genderFilter as
      | 'Male'
      | 'Female'
      | 'Total'
      | undefined,
    ageFilter: backendPayload.ageFilter as string | undefined,
    timeFilter: backendPayload.timeFilter as string | undefined,

    // 새 필드 (compare.areas)
    compareTargets: backendPayload.compareTargets as
      | {
          codeA: string;
          codeB: string;
          nameA?: string;
          nameB?: string;
        }
      | undefined,

    // 새 필드 (rent.calculate)
    rentParams: backendPayload.rentParams as
      | {
          area: number;
          deposit: number;
          rent: number;
        }
      | undefined,

    // 새 필드 (real_estate.recommend)
    maxDeposit: backendPayload.maxDeposit as number | undefined,
    maxMonthlyRent: backendPayload.maxMonthlyRent as number | undefined,
    minSize: backendPayload.minSize as number | undefined,
    keywords: backendPayload.keywords as string | undefined,
  };

  return { type: frontendType, payload };
}

// -----------------------------------------
// 여러 백엔드 액션을 프론트엔드 액션으로 변환
// -----------------------------------------
export function mapBackendActions(
  actions: Array<{ type: string; payload: Record<string, unknown> }>,
): AssistantAction[] {
  return actions
    .map((action) => mapBackendAction(action.type, action.payload))
    .filter((action): action is AssistantAction => action !== null);
}

// -----------------------------------------
// 액션 타입별 라벨 (UI 표시용)
// -----------------------------------------
export const ACTION_LABELS: Record<FrontendActionType, string> = {
  showMarker: '📍 위치 표시',
  highlightPolygon: '🔷 영역 하이라이트',
  compare: '⚖️ 상권 비교',
  showRanking: '🏆 매출 랭킹',
  filterPopulation: '👥 유동인구 필터',
  openAnalysisPanel: '📊 분석 패널',
  calculateRent: '💰 임대료 계산',
  generateReport: '📑 리포트 생성',
  recommendRealEstate: '🏠 매물 추천',
};

// -----------------------------------------
// 액션에 라벨 가져오기
// -----------------------------------------
export function getActionLabel(type: FrontendActionType): string {
  return ACTION_LABELS[type] || '알 수 없는 액션';
}
