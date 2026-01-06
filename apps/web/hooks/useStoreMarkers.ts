/**
 * useStoreMarkers - 업종별 매장 마커 표시 훅
 *
 * 🎯 목적:
 * - 치킨, 카페 등 특정 업종의 매장들을 지도에 마커로 표시
 * - useRealEstateMarkers와 유사한 패턴으로 구현
 *
 * 📚 핵심 개념:
 *
 * 1. useRef로 마커 관리
 *    - markersRef: 현재 지도에 표시된 마커들을 저장
 *    - React 리렌더링과 무관하게 마커 참조 유지
 *    - Kakao Maps 마커 객체는 DOM 요소이므로 ref로 관리해야 함
 *
 * 2. useEffect로 마커 갱신
 *    - stores 배열이 변경될 때마다 실행
 *    - 기존 마커 제거 → 새 마커 생성 순서로 동작
 *    - cleanup 함수에서 마커 정리 (메모리 누수 방지)
 *
 * 3. Kakao CustomOverlay
 *    - 일반 Marker 대신 CustomOverlay 사용
 *    - HTML 요소를 마커로 사용 가능 → 스타일링 자유도 높음
 *    - yAnchor: 마커 기준점 (1 = 아래쪽, 0 = 위쪽)
 */

import { useEffect, useRef } from 'react';

// ============================================
// 타입 정의
// ============================================

/** 매장 위치 데이터 (API 응답 형식) */
export interface StoreLocation {
  lng: number; // 경도 (longitude)
  lat: number; // 위도 (latitude)
  name: string; // 매장명
  address: string; // 주소
}

/** Kakao Maps 타입 (로컬 정의) */
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

// ============================================
// Kakao Maps 헬퍼
// ============================================

/**
 * window.kakao.maps 객체에 타입 안전하게 접근
 *
 * 💡 왜 이런 헬퍼가 필요한가?
 * - Kakao Maps SDK는 전역 window 객체에 로드됨
 * - TypeScript는 window.kakao를 모름 → type assertion 필요
 * - 매번 캐스팅하는 대신 헬퍼 함수로 추상화
 */
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

// ============================================
// 마커 데이터 구조
// ============================================

/** 저장된 마커 정보 */
interface MarkerData {
  overlay: KakaoCustomOverlay; // Kakao 오버레이 인스턴스
  element: HTMLElement; // 마커 DOM 요소
  store: StoreLocation; // 원본 매장 데이터
}

// ============================================
// 메인 훅
// ============================================

/**
 * 업종별 매장 마커를 지도에 표시하는 훅
 *
 * @param map - Kakao Map 인스턴스
 * @param stores - 표시할 매장 목록
 * @param onMarkerClick - 마커 클릭 시 콜백 (선택)
 *
 * @example
 * ```tsx
 * // AnalysisMap 내부에서 사용
 * useStoreMarkers(map, storeData, (store) => {
 *   console.log('클릭한 매장:', store.name);
 * });
 * ```
 */
export function useStoreMarkers(
  map: KakaoMapInstance | null,
  stores: StoreLocation[],
  onMarkerClick?: (store: StoreLocation) => void,
) {
  /**
   * markersRef: 마커 인스턴스 저장소
   *
   * 💡 왜 useRef를 사용하는가?
   * - useState로 마커를 저장하면 상태 변경 시 리렌더링 발생
   * - 마커는 지도에 표시만 하면 되므로 리렌더링 불필요
   * - useRef는 값이 변해도 리렌더링하지 않음
   */
  const markersRef = useRef<Map<string, MarkerData>>(new Map());

  /**
   * 마커 생성 및 갱신 로직
   *
   * 💡 의존성 배열 [map, stores, onMarkerClick]
   * - map: 지도 인스턴스가 바뀌면 마커 다시 그려야 함
   * - stores: 매장 데이터가 바뀌면 마커 갱신
   * - onMarkerClick: 콜백 변경 시 이벤트 리스너 갱신
   */
  useEffect(() => {
    const markers = markersRef.current;

    // ============================================
    // Step 1: 기존 마커 제거
    // ============================================
    // 새 데이터로 마커를 다시 그리기 전에 기존 마커 정리
    // overlay.setMap(null)로 지도에서 제거
    markers.forEach(({ overlay }) => overlay.setMap(null));
    markers.clear();

    // 지도 또는 데이터가 없으면 종료
    if (!map || !stores || stores.length === 0) return;

    // ============================================
    // Step 2: 새 마커 생성
    // ============================================
    stores.forEach((store, index) => {
      // 좌표 없으면 스킵
      if (!store.lat || !store.lng) return;

      // 마커 DOM 요소 생성
      const content = document.createElement('div');

      /**
       * 마커 스타일링 (Tailwind CSS 클래스)
       *
       * 🎨 디자인 포인트:
       * - 치킨 이모지로 업종 구분
       * - 흰색 배경 + 그림자로 가시성 확보
       * - hover 시 확대 효과 (scale-110)
       */
      content.className = `
        px-2 py-1 bg-white border border-orange-500 rounded-lg shadow-md
        hover:bg-orange-50 hover:scale-110 cursor-pointer
        transition-all duration-200 transform
        flex items-center gap-1
      `;

      content.innerHTML = `
        <span class="text-sm">🍗</span>
        <span class="text-xs font-medium text-orange-700 whitespace-nowrap max-w-[80px] truncate">
          ${store.name}
        </span>
      `;

      // 클릭 이벤트 등록
      if (onMarkerClick) {
        content.addEventListener('click', () => onMarkerClick(store));
      }

      // ============================================
      // Kakao CustomOverlay 생성
      // ============================================
      /**
       * 💡 CustomOverlay vs Marker
       * - Marker: 기본 핀 모양, 스타일 제한적
       * - CustomOverlay: HTML 요소 사용 가능, 완전한 커스터마이징
       *
       * yAnchor 설명:
       * - 0: 마커의 위쪽이 좌표 지점
       * - 1: 마커의 아래쪽이 좌표 지점 (일반적인 핀 마커처럼)
       * - 1.2: 마커 아래쪽 + 약간의 여백 (꼬리 효과)
       */
      const kakaoMaps = getKakaoMaps();
      const overlay = new kakaoMaps.CustomOverlay({
        position: new kakaoMaps.LatLng(store.lat, store.lng),
        content: content,
        yAnchor: 1.2, // 마커가 좌표 위에 뜨게
        zIndex: 10,
        clickable: true,
      });

      // 지도에 마커 추가
      overlay.setMap(map);

      // 마커 참조 저장 (나중에 제거할 때 사용)
      const key = `${store.lat}-${store.lng}-${index}`;
      markers.set(key, { overlay, element: content, store });
    });

    // ============================================
    // Cleanup 함수
    // ============================================
    /**
     * 💡 왜 cleanup이 필요한가?
     * - useEffect가 다시 실행되기 전에 이전 마커 정리
     * - 컴포넌트 언마운트 시 마커 제거 (메모리 누수 방지)
     */
    return () => {
      markers.forEach(({ overlay }) => overlay.setMap(null));
      markers.clear();
    };
  }, [map, stores, onMarkerClick]);
}
