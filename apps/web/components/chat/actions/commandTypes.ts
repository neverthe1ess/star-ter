import { type MarkerData } from '../types/markerTypes';
import { type AreaInfo } from '../types/mapTypes';
import { type PolygonData } from '../types';

export type MapCommand =
  | {
      type: 'map.pan_to';
      payload: {
        lat: number;
        lng: number;
        zoom?: number | null;
      };
    }
  | {
      type: 'map.setLayer';
      payload: {
        layer: string | null;
        visible?: boolean | null;
      };
    }
  | {
      type: 'map.setMarkers';
      payload: {
        markers: MarkerData[];
        fitBounds?: boolean;
      };
    }
  | {
      type: 'map.showCommercialArea';
      payload: {
        area: AreaInfo;
        polygon: PolygonData;
      };
    }
  | {
      type: 'map.fetchArea'; // 상권 정보 fetch 요청 (SimilarAreasCard 클릭 시)
      payload: {
        areaCode: string;
      };
    };

export interface ActionDispatchPayload {
  mapCommands?: MapCommand[];
  openMapPanel?: boolean;
  areaCodeToFetch?: string; // 상권 클릭 시 폴리곤 + 정보 가져오기용
}
