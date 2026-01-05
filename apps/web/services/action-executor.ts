import { ClientAction } from '@/types/actions';
import { useMapStore } from '@/stores/useMapStore';
import { useSidebarStore } from '@/stores/useSidebarStore';

/**
 * ActionExecutor
 * AI로부터 받은 ClientAction 배열을 실행하여 실제 UI 변경을 수행합니다.
 */
export class ActionExecutor {
  /**
   * 액션 배열을 순차적으로 실행
   */
  static execute(actions: ClientAction[]): void {
    if (!actions || actions.length === 0) {
      console.log('[ActionExecutor] No actions to execute');
      return;
    }

    console.log('[ActionExecutor] Executing actions:', actions);

    actions.forEach((action, index) => {
      try {
        this.executeAction(action);
      } catch (error) {
        console.error(
          `[ActionExecutor] Error executing action ${index}:`,
          error,
        );
      }
    });
  }

  /**
   * 개별 액션을 실행
   * TODO: 추후 전략 패턴 또는 커맨드 패턴으로 리팩토링 예정(현재는 3가지 밖에 없어서 보류함)
   */
  private static executeAction(action: ClientAction): void {
    switch (action.type) {
      case 'map.pan_to':
        this.executeMapPanTo(action.payload);
        break;

      case 'ui.open_panel':
        this.executeUiOpenPanel(action.payload);
        break;

      case 'map.highlight':
        this.executeMapHighlight(action.payload);
        break;

      default:
        console.warn('[ActionExecutor] Unknown action type:', action);
    }
  }

  /**
   * 지도 이동 액션
   */
  private static executeMapPanTo(payload: {
    lat: number;
    lng: number;
    zoom?: number;
  }): void {
    const { lat, lng, zoom = 3 } = payload;

    console.log(
      `[ActionExecutor] Moving map to (${lat}, ${lng}), zoom: ${zoom}`,
    );

    useMapStore
      .getState()
      .moveToLocation(
        { lat, lng },
        `AI Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        zoom,
      );
  }

  /**
   * UI 패널 열기 액션
   */
  private static executeUiOpenPanel(payload: {
    panelType: 'summary' | 'comparison';
    level?: 'gu' | 'dong' | 'commercial';
    lat?: number;
    lng?: number;
    areaName?: string;
  }): void {
    const { panelType, level, lat, lng, areaName } = payload;

    console.log(`[ActionExecutor] Opening panel: ${panelType}`, payload);

    // summary 패널: InfoBar 열기 (selectArea를 통해 데이터 주입)
    if (panelType === 'summary') {
      if (lat && lng && level) {
        useSidebarStore.getState().selectArea({
          x: lng,
          y: lat,
          level,
          adm_nm: areaName,
          // 필요한 경우 다른 코드도 매핑 (현재는 이름과 좌표, 레벨로 충분)
        });
      } else {
        // 데이터가 부족하면 그냥 열기만 함 (빈 상태)
        useSidebarStore.getState().setInfoBarOpen(true);
      }
    }

    // 추가 panelType은 여기에 구현
  }

  /**
   * 지도 하이라이트 액션
   */
  private static executeMapHighlight(payload: {
    areaCode?: string;
    areaName?: string;
    color?: string;
  }): void {
    console.log('[ActionExecutor] Highlight action:', payload);

    // TODO: 하이라이트 로직 구현 (지도 컴포넌트와 연동 필요)
    // 예: 특정 폴리곤에 색상을 입히거나 테두리를 강조
  }
}
