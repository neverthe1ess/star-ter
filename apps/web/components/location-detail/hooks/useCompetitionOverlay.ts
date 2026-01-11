/**
 * 【useCompetitionOverlay 커스텀 훅】
 *
 * 점포 좌표를 기반으로 경쟁 밀집도를 계산하고
 * 지도에 표시할 오버레이 데이터를 생성합니다.
 *
 * 📚 알고리즘:
 * 1. 각 점포 위치에서 반경 내 다른 점포 수를 계산
 * 2. 밀집도가 높을수록 빨간색, 낮을수록 초록색
 * 3. 반경 내 점포가 많을수록 오버레이 크기도 커짐
 */

import { useMemo } from 'react';
import type { StoreLocation } from './useStoreLocations';

// 오버레이 데이터 타입
export interface CompetitionZone {
  lat: number;
  lng: number;
  density: number; // 0~1 밀집도
  storeCount: number; // 해당 영역 점포 수
  color: string; // 색상 (rgba)
  radius: number; // 반경 (미터)
}

interface UseCompetitionOverlayOptions {
  gridSize?: number; // 격자 크기 (미터), 기본 50m
  maxRadius?: number; // 최대 오버레이 반경 (미터), 기본 80m
  minRadius?: number; // 최소 오버레이 반경 (미터), 기본 30m
}

/**
 * 두 좌표 간 거리 계산 (Haversine 공식, 미터 단위)
 */
function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // 지구 반경 (미터)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 밀집도에 따른 색상 반환 (초록 → 노랑 → 빨강)
 */
function getDensityColor(density: number): string {
  // 0: 초록(안전), 0.5: 노랑(보통), 1: 빨강(위험)
  const opacity = 0.3 + density * 0.4; // 0.3 ~ 0.7

  if (density < 0.3) {
    // 초록 계열
    return `rgba(34, 197, 94, ${opacity})`; // green-500
  } else if (density < 0.6) {
    // 노랑/주황 계열
    return `rgba(251, 191, 36, ${opacity})`; // amber-400
  } else {
    // 빨강 계열
    return `rgba(239, 68, 68, ${opacity})`; // red-500
  }
}

export function useCompetitionOverlay(
  stores: StoreLocation[],
  options: UseCompetitionOverlayOptions = {},
): CompetitionZone[] {
  const {
    gridSize = 50, // 50m 격자
    maxRadius = 80,
    minRadius = 30,
  } = options;

  return useMemo(() => {
    if (stores.length === 0) return [];

    // 1. 각 점포 위치에서 주변 점포 수 계산
    const storesByDensity: { store: StoreLocation; nearbyCount: number }[] =
      stores.map((store) => {
        // 해당 점포 기준 gridSize*2 반경 내 점포 수 계산
        const nearbyCount = stores.filter((other) => {
          if (other === store) return false;
          const dist = getDistanceMeters(
            store.lat,
            store.lng,
            other.lat,
            other.lng,
          );
          return dist <= gridSize * 2;
        }).length;

        return { store, nearbyCount };
      });

    // 2. 최대 밀집도 찾기 (정규화용)
    const maxNearby = Math.max(...storesByDensity.map((s) => s.nearbyCount), 1);

    // 3. 밀집도 기반으로 클러스터링 (너무 많은 오버레이 방지)
    const zones: CompetitionZone[] = [];
    const processed = new Set<number>();

    storesByDensity
      .sort((a, b) => b.nearbyCount - a.nearbyCount) // 밀집도 높은 순
      .forEach((item, index) => {
        if (processed.has(index)) return;

        // 이미 처리된 근처 점포는 스킵
        const isNearProcessed = zones.some((zone) => {
          const dist = getDistanceMeters(
            item.store.lat,
            item.store.lng,
            zone.lat,
            zone.lng,
          );
          return dist < gridSize;
        });

        if (isNearProcessed) {
          processed.add(index);
          return;
        }

        // 밀집도 계산 (0~1)
        const density = Math.min(item.nearbyCount / maxNearby, 1);

        // 반경: 밀집도 높을수록 크게
        const radius = minRadius + (maxRadius - minRadius) * density;

        zones.push({
          lat: item.store.lat,
          lng: item.store.lng,
          density,
          storeCount: item.nearbyCount + 1, // 자기 자신 포함
          color: getDensityColor(density),
          radius,
        });

        processed.add(index);
      });

    return zones;
  }, [stores, gridSize, maxRadius, minRadius]);
}
