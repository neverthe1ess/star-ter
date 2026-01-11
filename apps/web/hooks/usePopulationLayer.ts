'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  TimeFilter,
  GenderFilter,
  AgeFilter,
  CombinedFeature,
  CombinedLayerResponse,
} from '../components/location-detail/types';

// =============================================
// 【색상 팔레트】 히트맵 강도별 색상 (Cold → Hot)
// =============================================
const colorPalette = (function () {
  const palette = new Uint8ClampedArray(256 * 3);
  const gradient = [
    { stop: 0, color: [10, 10, 50] },
    { stop: 60, color: [0, 100, 255] },
    { stop: 110, color: [0, 220, 200] },
    { stop: 170, color: [255, 230, 0] },
    { stop: 230, color: [255, 100, 0] },
    { stop: 255, color: [255, 255, 255] },
  ];

  for (let alpha = 0; alpha < 256; alpha++) {
    for (let i = 0; i < gradient.length - 1; i++) {
      if (alpha >= gradient[i].stop && alpha <= gradient[i + 1].stop) {
        const ratio =
          (alpha - gradient[i].stop) /
          (gradient[i + 1].stop - gradient[i].stop);
        palette[alpha * 3] = Math.round(
          gradient[i].color[0] +
            (gradient[i + 1].color[0] - gradient[i].color[0]) * ratio,
        );
        palette[alpha * 3 + 1] = Math.round(
          gradient[i].color[1] +
            (gradient[i + 1].color[1] - gradient[i].color[1]) * ratio,
        );
        palette[alpha * 3 + 2] = Math.round(
          gradient[i].color[2] +
            (gradient[i + 1].color[2] - gradient[i].color[2]) * ratio,
        );
        break;
      }
    }
  }
  return palette;
})();

// =============================================
// 【유틸】 유동인구 값 추출 함수
// =============================================

// 시간대 필터를 슬롯 인덱스로 매핑 (3개 슬롯)
const TIME_FILTER_TO_INDEX: Record<TimeFilter, number> = {
  dawn: 0, // 새벽 0-8시
  day: 1, // 낮 8-16시
  night: 2, // 밤 16-24시
};

// 연령대 필터를 실제 키로 매핑
const AGE_FILTER_TO_KEY: Record<string, string> = {
  age_10: 'age_10s_total',
  age_20: 'age_20s_total',
  age_30: 'age_30s_total',
  age_40: 'age_40s_total',
  age_50: 'age_50s_total',
  age_60: 'age_60s_plus_total',
};

export function getPopulationValue(
  feature: CombinedFeature,
  time: TimeFilter,
  gender: GenderFilter,
  age: AgeFilter,
): number {
  const timeSlots = feature.time_slots;

  if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
    return 0;
  }

  const slotIndex = TIME_FILTER_TO_INDEX[time] ?? 1;
  const slot = timeSlots[Math.min(slotIndex, timeSlots.length - 1)];

  if (!slot) return 0;

  let value = 0;

  if (gender === 'all' && age === 'all') {
    value = slot.sum_population ?? slot.avg_population ?? 0;
  } else if (gender !== 'all' && age === 'all') {
    value =
      gender === 'male' ? (slot.male_total ?? 0) : (slot.female_total ?? 0);
  } else if (gender === 'all' && age !== 'all') {
    const ageKey = AGE_FILTER_TO_KEY[age] ?? 'age_20s_total';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value = (slot as any)[ageKey] ?? 0;
  } else {
    const ageKey = AGE_FILTER_TO_KEY[age] ?? 'age_20s_total';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value = (slot as any)[ageKey] ?? 0;
  }

  return typeof value === 'number' ? value : 0;
}

// =============================================
// 【훅】 usePopulationLayer - Canvas 기반 히트맵 렌더링
// =============================================

interface UsePopulationLayerParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any;
  timeFilter: TimeFilter;
  genderFilter: GenderFilter;
  ageFilter: AgeFilter;
  isVisible: boolean;
  containerId?: string;
}

export const usePopulationLayer = ({
  map,
  timeFilter,
  genderFilter,
  ageFilter,
  isVisible,
  containerId = 'traffic-map-container',
}: UsePopulationLayerParams) => {
  const featuresMapRef = useRef<Map<string, CombinedFeature>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const featuresRef = useRef<CombinedFeature[]>([]);
  const isVisibleRef = useRef<boolean>(isVisible);

  useEffect(() => {
    isVisibleRef.current = isVisible;
    if (!isVisible) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      featuresMapRef.current.clear();
      featuresRef.current = [];
      const existing = document.getElementById('population-heatmap-canvas');
      if (existing?.parentNode) existing.parentNode.removeChild(existing);
      canvasRef.current = null;
    }
  }, [isVisible]);

  const renderLayer = useCallback(() => {
    try {
      const container = document.getElementById(containerId);
      if (!map || !container || !isVisibleRef.current) return;

      const currentZoom = map.getLevel();
      const currentFeatures = featuresRef.current;

      if (currentZoom < 1 || currentZoom > 6 || currentFeatures.length === 0)
        return;

      const projection = map.getProjection();
      if (!projection) return;

      const CANVAS_ID = 'population-heatmap-canvas';
      let canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = CANVAS_ID;
        canvas.style.cssText =
          'position:absolute;left:0;top:0;width:100%;height:100%;z-index:10;pointer-events:none;';
        container.appendChild(canvas);
      }
      canvasRef.current = canvas;

      const BUFFER_RATIO = 1.5;
      const fullWidth = container.offsetWidth;
      const fullHeight = container.offsetHeight;
      if (fullWidth <= 0 || fullHeight <= 0) return;

      const DOWNSAMPLE = 0.5;
      const width = Math.floor(fullWidth * DOWNSAMPLE * BUFFER_RATIO);
      const height = Math.floor(fullHeight * DOWNSAMPLE * BUFFER_RATIO);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${fullWidth * BUFFER_RATIO}px`;
        canvas.style.height = `${fullHeight * BUFFER_RATIO}px`;
        canvas.style.left = `${-(fullWidth * (BUFFER_RATIO - 1)) / 2}px`;
        canvas.style.top = `${-(fullHeight * (BUFFER_RATIO - 1)) / 2}px`;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const values = currentFeatures.map((f) =>
        getPopulationValue(f, timeFilter, genderFilter, ageFilter),
      );
      const maxValue = values.length > 0 ? Math.max(...values, 1) : 1;

      const configMap: Record<
        number,
        { radius: number; intensity: number; points: number; spread: number }
      > = {
        1: {
          radius: 25 * DOWNSAMPLE,
          intensity: 2.0,
          points: 100,
          spread: 700 * DOWNSAMPLE,
        },
        2: {
          radius: 25 * DOWNSAMPLE,
          intensity: 1.8,
          points: 80,
          spread: 300 * DOWNSAMPLE,
        },
        3: {
          radius: 35 * DOWNSAMPLE,
          intensity: 1.4,
          points: 40,
          spread: 200 * DOWNSAMPLE,
        },
        4: {
          radius: 45 * DOWNSAMPLE,
          intensity: 1.1,
          points: 20,
          spread: 100 * DOWNSAMPLE,
        },
        5: {
          radius: 55 * DOWNSAMPLE,
          intensity: 0.9,
          points: 10,
          spread: 50 * DOWNSAMPLE,
        },
        6: {
          radius: 65 * DOWNSAMPLE,
          intensity: 0.7,
          points: 5,
          spread: 25 * DOWNSAMPLE,
        },
      };
      const config = configMap[currentZoom] || {
        radius: 50 * DOWNSAMPLE,
        intensity: 0.8,
        points: 10,
        spread: 50,
      };

      let drawnCount = 0;
      currentFeatures.forEach((f) => {
        if (!f.center) return;
        try {
          const latlng = new window.kakao.maps.LatLng(
            f.center.lat,
            f.center.lng,
          );
          const pos = projection.containerPointFromCoords(latlng);
          if (!pos || isNaN(pos.x) || isNaN(pos.y)) return;

          const offsetX = (fullWidth * (BUFFER_RATIO - 1)) / 2;
          const offsetY = (fullHeight * (BUFFER_RATIO - 1)) / 2;
          const baseX = (pos.x + offsetX) * DOWNSAMPLE;
          const baseY = (pos.y + offsetY) * DOWNSAMPLE;

          const value = getPopulationValue(
            f,
            timeFilter,
            genderFilter,
            ageFilter,
          );
          const weight = value / maxValue;
          if (weight <= 0.0001) return;

          let cellHash = 0;
          for (let j = 0; j < f.cell_id.length; j++) {
            cellHash = (cellHash << 5) - cellHash + f.cell_id.charCodeAt(j);
            cellHash |= 0;
          }

          for (let i = 0; i < config.points; i++) {
            let px = baseX;
            let py = baseY;
            const seedA = cellHash + i * 1337.5;
            const seedB = cellHash + i * 2187.3;

            if (i > 0) {
              const randomAngle =
                (Math.abs(Math.sin(seedA) * 10000) % 1) * Math.PI * 2;
              const randomDist =
                (Math.abs(Math.cos(seedB) * 10000) % 1) * config.spread;
              px += Math.cos(randomAngle) * randomDist;
              py += Math.sin(randomAngle) * randomDist;
            }

            const baseScale = 0.5 + weight * 1.5;
            const variance =
              1 + ((Math.abs(Math.sin(seedA * 3)) % 1) * 0.3 - 0.15);
            const currentRadius = config.radius * baseScale * variance;
            const intensityAlpha = Math.min(
              weight * config.intensity * (0.8 + (1 - baseScale) * 0.5),
              0.5,
            );

            const grad = ctx.createRadialGradient(
              px,
              py,
              0,
              px,
              py,
              currentRadius,
            );
            grad.addColorStop(0, `rgba(0,0,0,${intensityAlpha})`);
            grad.addColorStop(0.4, `rgba(0,0,0,${intensityAlpha * 0.4})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            drawnCount++;
          }
        } catch {
          // 개별 포인트 에러 무시
        }
      });

      if (drawnCount > 0) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 3) {
            const baseIdx = alpha * 3;
            data[i] = colorPalette[baseIdx];
            data[i + 1] = colorPalette[baseIdx + 1];
            data[i + 2] = colorPalette[baseIdx + 2];
            data[i + 3] = alpha * 0.6;
          } else {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    } catch (e) {
      console.error('[usePopulationLayer] Render error:', e);
    }
  }, [map, timeFilter, genderFilter, ageFilter, containerId]);

  const fetchData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (currentMap: any) => {
      if (!isVisibleRef.current) return;
      const currentZoom = currentMap.getLevel();
      if (currentZoom > 6) return;
      const bounds = currentMap.getBounds();
      if (!bounds?.getSouthWest) return;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const latDiff = ne.getLat() - sw.getLat();
      const lngDiff = ne.getLng() - sw.getLng();

      const paddedSw = {
        lat: sw.getLat() - latDiff * 0.5,
        lng: sw.getLng() - lngDiff * 0.5,
      };
      const paddedNe = {
        lat: ne.getLat() + latDiff * 0.5,
        lng: ne.getLng() + lngDiff * 0.5,
      };

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const params = new URLSearchParams({
          minLat: paddedSw.lat.toString(),
          minLng: paddedSw.lng.toString(),
          maxLat: paddedNe.lat.toString(),
          maxLng: paddedNe.lng.toString(),
        });

        const response = await fetch(
          `${API_BASE_URL}/floating-population/layer?${params.toString()}`,
          { signal: abortControllerRef.current.signal },
        );

        if (!response.ok) return;

        const data: CombinedLayerResponse = await response.json();
        if (!data || !isVisibleRef.current) return;

        let hasNew = false;
        const newMap = new Map<string, CombinedFeature>(featuresMapRef.current);

        data.features.forEach((f) => {
          if (!newMap.has(f.cell_id)) {
            const geometry = f.geometry;
            if (geometry.type === 'Polygon' && geometry.coordinates[0]?.[0]) {
              const coord = geometry.coordinates[0][0] as number[];
              f.center = { lng: coord[0], lat: coord[1] };
            } else if (
              geometry.type === 'MultiPolygon' &&
              geometry.coordinates[0]?.[0]?.[0]
            ) {
              const coord = geometry.coordinates[0][0][0] as number[];
              f.center = { lng: coord[0], lat: coord[1] };
            }
            newMap.set(f.cell_id, f);
            hasNew = true;
          }
        });

        if (newMap.size > 3000) {
          const iterator = newMap.keys();
          for (let i = 0; i < 1000; i++) {
            const key = iterator.next().value;
            if (key) newMap.delete(key);
          }
          hasNew = true;
        }

        if (hasNew) {
          featuresMapRef.current = newMap;
          featuresRef.current = Array.from(newMap.values());
          renderLayer();
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('[usePopulationLayer] Fetch error:', err);
      }
    },
    [renderLayer],
  );

  useEffect(() => {
    if (isVisible) renderLayer();
  }, [timeFilter, genderFilter, ageFilter, isVisible, renderLayer]);

  useEffect(() => {
    if (map && isVisible) fetchData(map);
  }, [map, isVisible, fetchData]);

  useEffect(() => {
    const kakaoMaps = window.kakao?.maps;
    if (!map || !kakaoMaps?.event) return;
    const eventApi = kakaoMaps.event;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listeners: any[] = [];

    if (isVisible) {
      renderLayer();

      try {
        listeners.push(
          eventApi.addListener(map, 'idle', () => {
            if (!isVisibleRef.current) return;
            if (canvasRef.current)
              canvasRef.current.style.transform = 'translate(0px, 0px)';
            renderLayer();
            if (debounceTimerRef.current)
              clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              if (isVisibleRef.current) fetchData(map);
            }, 300);
          }),
        );

        listeners.push(
          eventApi.addListener(map, 'zoom_changed', () => {
            if (!isVisibleRef.current) return;
            if (canvasRef.current)
              canvasRef.current.style.transform = 'translate(0px, 0px)';
          }),
        );
      } catch (e) {
        console.error('[usePopulationLayer] Failed to add map listeners', e);
      }
    }

    return () => {
      if (!window.kakao?.maps?.event) return;
      const eventApi = window.kakao.maps.event;
      listeners.forEach((l) => {
        try {
          if (l) eventApi.removeListener(l);
        } catch {}
      });
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [map, renderLayer, fetchData, isVisible]);
};
