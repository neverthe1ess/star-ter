import { useEffect, useRef } from 'react';
import { RealEstateItem } from '../types/map-store-types';
import { useMapStore } from '../stores/useMapStore';

interface ClusterGroup {
  key: string;
  lat: number;
  lng: number;
  items: RealEstateItem[];
}

interface OverlayData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overlay: any;
  element: HTMLElement;
  itemIds: string[]; // 클러스터의 경우 여러 개, 단일 마커의 경우 1개
  isCluster: boolean;
}

export function useRealEstateMarkers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any,
  data: RealEstateItem[],
  onMarkerClick?: (item: RealEstateItem) => void,
  hoveredItemId?: string | null,
) {
  const overlaysRef = useRef<Map<string, OverlayData>>(new Map());

  // 1. 좌표별로 그룹화
  const groupByCoords = (items: RealEstateItem[]): ClusterGroup[] => {
    const groups = new Map<string, ClusterGroup>();

    items.forEach((item) => {
      if (item.deposit === 0 && item.monthlyrent === 0) return;
      if (!item.centerlatitude || !item.centerlongitude) return;

      const lat = Math.round(item.centerlatitude * 1000000) / 1000000;
      const lng = Math.round(item.centerlongitude * 1000000) / 1000000;
      const key = `${lat},${lng}`;

      if (!groups.has(key)) {
        groups.set(key, { key, lat, lng, items: [] });
      }
      groups.get(key)!.items.push(item);
    });

    return Array.from(groups.values());
  };

  // 2. 데이터 변경 시 마커(오버레이) 생성 및 갱신
  useEffect(() => {
    const overlays = overlaysRef.current;
    const setFilteredClusterCoords =
      useMapStore.getState().setFilteredClusterCoords;

    // 기존 오버레이 제거
    overlays.forEach(({ overlay }) => overlay.setMap(null));
    overlays.clear();

    if (!map || !data) return;

    const groups = groupByCoords(data);

    groups.forEach((group) => {
      const content = document.createElement('div');
      const isCluster = group.items.length > 1;
      const itemIds = group.items.map((item) => item.id);

      if (isCluster) {
        // 클러스터 마커 스타일 (단일 마커와 동일한 패턴)
        content.className = `
          px-3 py-2 bg-white border-2 border-blue-600 rounded-full shadow-lg
          hover:bg-blue-50 cursor-pointer flex items-center justify-center
          transition-all duration-200 transform
        `;
        content.innerHTML = `
          <span class="text-sm font-bold text-blue-600">${group.items.length}건</span>
        `;

        content.addEventListener('click', () => {
          setFilteredClusterCoords({ lat: group.lat, lng: group.lng });
        });
      } else {
        // 단일 마커 스타일
        const item = group.items[0];
        content.className = `
          px-2 py-1 bg-white border border-blue-600 rounded-lg shadow-md 
          hover:bg-blue-50 cursor-pointer flex flex-col items-center 
          transition-all duration-200 transform
        `;
        content.innerHTML = `
          <div class="text-xs font-bold text-blue-600 whitespace-nowrap">
             ${formatMoney(item.deposit)}/${formatMoney(item.monthlyrent)}
          </div>
        `;

        content.addEventListener('click', () => {
          if (onMarkerClick) onMarkerClick(item);
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const overlay = new (window as any).kakao.maps.CustomOverlay({
        position: new (window as any).kakao.maps.LatLng(group.lat, group.lng),
        content: content,
        yAnchor: 1.2,
        zIndex: isCluster ? 15 : 10,
        clickable: true,
      });

      overlay.setMap(map);
      overlays.set(group.key, {
        overlay,
        element: content,
        itemIds,
        isCluster,
      });
    });

    return () => {
      overlays.forEach(({ overlay }) => overlay.setMap(null));
      overlays.clear();
    };
  }, [map, data, onMarkerClick]);

  // 3. 호버 상태 변경 시 스타일 업데이트 (클러스터 포함)
  useEffect(() => {
    overlaysRef.current.forEach(({ overlay, element, itemIds, isCluster }) => {
      const isHovered = hoveredItemId ? itemIds.includes(hoveredItemId) : false;

      if (isCluster) {
        // 클러스터 마커 호버 스타일 (단일 마커와 동일)
        if (isHovered) {
          overlay.setZIndex(25);
          element.classList.add(
            'bg-blue-600',
            'scale-110',
            'ring-2',
            'ring-white',
          );
          element.classList.remove('bg-white', 'hover:bg-blue-50');

          const textEl = element.querySelector('span');
          if (textEl) {
            textEl.classList.remove('text-blue-600');
            textEl.classList.add('text-white');
          }
        } else {
          overlay.setZIndex(15);
          element.classList.remove(
            'bg-blue-600',
            'scale-110',
            'ring-2',
            'ring-white',
          );
          element.classList.add('bg-white', 'hover:bg-blue-50');

          const textEl = element.querySelector('span');
          if (textEl) {
            textEl.classList.remove('text-white');
            textEl.classList.add('text-blue-600');
          }
        }
      } else {
        // 단일 마커 호버 스타일
        if (isHovered) {
          overlay.setZIndex(20);
          element.classList.add(
            'bg-blue-600',
            'scale-110',
            'ring-2',
            'ring-white',
          );
          element.classList.remove('bg-white', 'hover:bg-blue-50');

          const textEl = element.querySelector('div');
          if (textEl) {
            textEl.classList.remove('text-blue-600');
            textEl.classList.add('text-white');
          }
        } else {
          overlay.setZIndex(10);
          element.classList.remove(
            'bg-blue-600',
            'scale-110',
            'ring-2',
            'ring-white',
          );
          element.classList.add('bg-white', 'hover:bg-blue-50');

          const textEl = element.querySelector('div');
          if (textEl) {
            textEl.classList.remove('text-white');
            textEl.classList.add('text-blue-600');
          }
        }
      }
    });
  }, [hoveredItemId]);
}

function formatMoney(value: number | null): string {
  if (!value) return '0';
  const won = value * 1000;
  if (won >= 100000000) {
    const eok = won / 100000000;
    return `${Number.isInteger(eok) ? eok : eok.toFixed(1)}억`;
  } else if (won >= 10000) {
    return `${Math.round(won / 10000).toLocaleString()}만`;
  }
  return `${(won / 10000).toFixed(1)}만`;
}
