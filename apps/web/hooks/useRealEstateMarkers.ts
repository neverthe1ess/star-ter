import { useEffect, useRef } from 'react';
import { RealEstateItem } from '../types/map-store-types';
import { useMapStore } from '../stores/useMapStore';

// Kakao Maps API 타입 정의 (로컬 전용)
interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoCustomOverlay {
  setMap(map: KakaoMapInstance | null): void;
  setZIndex(zIndex: number): void;
}

interface KakaoMapInstance {
  getCenter(): KakaoLatLng;
  getLevel(): number;
}

// window.kakao.maps 접근을 위한 타입 안전한 헬퍼
function getKakaoMaps(): {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  CustomOverlay: new (options: {
    position: KakaoLatLng;
    content: HTMLElement | string;
    yAnchor?: number;
    zIndex?: number;
    clickable?: boolean;
  }) => KakaoCustomOverlay;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).kakao.maps;
}

interface ClusterGroup {
  key: string;
  lat: number;
  lng: number;
  items: RealEstateItem[];
}

interface OverlayData {
  overlay: KakaoCustomOverlay;
  element: HTMLElement;
  itemIds: string[];
  isCluster: boolean;
}

export function useRealEstateMarkers(
  map: KakaoMapInstance | null,
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
        // 클러스터: 1층에 가장 가까운 층의 매물을 대표로 표시
        // |floor - 1| 최솟값을 찾음 (1층이 가장 선호)
        const representativeItem = group.items.reduce((closest, current) => {
          const closestDistance = Math.abs((closest.floor ?? 999) - 1);
          const currentDistance = Math.abs((current.floor ?? 999) - 1);
          return currentDistance < closestDistance ? current : closest;
        }, group.items[0]);

        // 클러스터 마커 스타일 (단일 마커와 유사 + 카운트 배지)
        content.className = `
          relative px-2 py-1 bg-white border border-blue-600 rounded-lg shadow-md
          hover:bg-blue-50 cursor-pointer flex flex-col items-center
          transition-all duration-200 transform
        `;
        content.innerHTML = `
          <div class="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-xs font-bold text-white">${group.items.length}</span>
          </div>
          <div class="text-xs font-bold text-blue-600 whitespace-nowrap">
            ${formatMoney(representativeItem.deposit)}/${formatMoney(representativeItem.monthlyrent)}
          </div>
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

      const kakaoMaps = getKakaoMaps();
      const overlay = new kakaoMaps.CustomOverlay({
        position: new kakaoMaps.LatLng(group.lat, group.lng),
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
        // 클러스터 마커 호버 스타일 (가격 표시 div 대상)
        if (isHovered) {
          overlay.setZIndex(25);
          element.classList.add(
            'bg-blue-600',
            'scale-110',
            'ring-2',
            'ring-white',
          );
          element.classList.remove('bg-white', 'hover:bg-blue-50');

          // 가격 텍스트 색상 변경 (배지 제외)
          const priceEl = element.querySelector('div.text-blue-600');
          if (priceEl) {
            priceEl.classList.remove('text-blue-600');
            priceEl.classList.add('text-white');
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

          const priceEl = element.querySelector('div.text-white');
          if (priceEl) {
            priceEl.classList.remove('text-white');
            priceEl.classList.add('text-blue-600');
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
