import { useEffect, useRef } from 'react';
import { RealEstateItem } from '../types/map-store-types';

export function useRealEstateMarkers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any,
  data: RealEstateItem[],
  onMarkerClick?: (item: RealEstateItem) => void,
  hoveredItemId?: string | null,
) {
  const overlaysRef = useRef<
    Map<string, { overlay: any; element: HTMLElement }>
  >(new Map());

  // 1. 데이터 변경 시 마커(오버레이) 생성 및 갱신
  useEffect(() => {
    const overlays = overlaysRef.current;

    // 기존 오버레이 제거
    overlays.forEach(({ overlay }) => overlay.setMap(null));
    overlays.clear();

    if (!map || !data) return;

    data.forEach((item) => {
      // 보증금/월세가 모두 0인 경우 제외
      if (item.deposit === 0 && item.monthlyrent === 0) return;

      const content = document.createElement('div');
      // 기본 스타일
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

      // 클릭 이벤트
      content.addEventListener('click', () => {
        if (onMarkerClick) onMarkerClick(item);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const overlay = new (window as any).kakao.maps.CustomOverlay({
        position: new (window as any).kakao.maps.LatLng(
          item.centerlatitude,
          item.centerlongitude,
        ),
        content: content,
        yAnchor: 1.2,
        zIndex: 10,
        clickable: true,
      });

      overlay.setMap(map);
      overlays.set(item.id, { overlay, element: content });
    });

    return () => {
      overlays.forEach(({ overlay }) => overlay.setMap(null));
      overlays.clear();
    };
  }, [map, data, onMarkerClick]);

  // 2. 호버 상태 변경 시 스타일 업데이트
  useEffect(() => {
    overlaysRef.current.forEach(({ overlay, element }, id) => {
      const isHovered = id === hoveredItemId;

      if (isHovered) {
        overlay.setZIndex(20);
        element.classList.add(
          'bg-blue-600',
          'scale-110',
          'ring-2',
          'ring-white',
        );
        element.classList.remove('bg-white', 'hover:bg-blue-50');

        // 텍스트 색상 변경 (innerHTML 구조에 의존)
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
