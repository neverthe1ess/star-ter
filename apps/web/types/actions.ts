// 백엔드 JSON Schema와 일치하는 ClientAction 타입 정의

export type ActionType = 'map.pan_to' | 'ui.open_panel' | 'map.highlight';

// 기본 액션 인터페이스
export interface BaseAction {
  type: ActionType;
  payload: Record<string, any>;
}

// 지도 이동 액션
export interface MapPanToAction extends BaseAction {
  type: 'map.pan_to';
  payload: {
    lat: number;
    lng: number;
    zoom?: number;
  };
}

// UI 패널 열기 액션
export interface UiOpenPanelAction extends BaseAction {
  type: 'ui.open_panel';
  payload: {
    panelType: 'summary' | 'comparison';
  };
}

// 지도 하이라이트 액션
export interface MapHighlightAction extends BaseAction {
  type: 'map.highlight';
  payload: {
    areaCode?: string;
    areaName?: string;
    color?: string;
  };
}

// 모든 ClientAction 유니온 타입
export type ClientAction =
  | MapPanToAction
  | UiOpenPanelAction
  | MapHighlightAction;

// 백엔드 응답 구조 (Structured Outputs)
export interface AssistantResponse {
  reply: string;
  actions: ClientAction[];
}
