'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  TimeFilter,
  GenderFilter,
  AgeFilter,
  HourlyFeature,
  HourlyLayerResponse,
  AGE_FILTER_TO_KEY,
} from '../types';

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
// 【유틸】 유동인구 값 추출 함수 (1시간 단위)
// =============================================
export function getPopulationValue(
  feature: HourlyFeature,
  hour: TimeFilter, // 0~23
  gender: GenderFilter,
  age: AgeFilter,
): number {
  const hourlyData = feature.hourly_data;

  if (!hourlyData || !Array.isArray(hourlyData) || hourlyData.length === 0) {
    return 0;
  }

  // 해당 시간대 데이터 찾기
  const hourData = hourlyData.find((h) => h.hour === hour);
  if (!hourData) return 0;

  let value = 0;

  if (gender === 'all' && age === 'all') {
    value = hourData.sum_population ?? hourData.avg_population ?? 0;
  } else if (gender !== 'all' && age === 'all') {
    value =
      gender === 'male'
        ? (hourData.male_total ?? 0)
        : (hourData.female_total ?? 0);
  } else if (gender === 'all' && age !== 'all') {
    const ageKey = AGE_FILTER_TO_KEY[age];
    value = ((hourData as Record<string, unknown>)[ageKey] as number) ?? 0;
  } else {
    const ageKey = AGE_FILTER_TO_KEY[age];
    value = ((hourData as Record<string, unknown>)[ageKey] as number) ?? 0;
  }

  return typeof value === 'number' ? value : 0;
}

// =============================================
// 【훅】 usePopulationLayer - Canvas 기반 히트맵 렌더링
// =============================================

interface UsePopulationLayerParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any;
  hour: TimeFilter; // 0~23
  genderFilter: GenderFilter;
  ageFilter: AgeFilter;
  isVisible: boolean;
  containerId?: string;
}

export const usePopulationLayer = ({
  map,
  hour,
  genderFilter,
  ageFilter,
  isVisible,
  containerId = 'traffic-map-container',
}: UsePopulationLayerParams) => {
  const featuresMapRef = useRef<Map<string, HourlyFeature>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const featuresRef = useRef<HourlyFeature[]>([]);
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

  const hourRef = useRef<number>(hour);
  useEffect(() => {
    hourRef.current = hour;
  }, [hour]);

  // 렌더링 요청을 위한 ref
  const rafRef = useRef<number | null>(null);

  const renderLayer = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
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

        const ctx = canvas.getContext('2d', {
          willReadFrequently: true,
          alpha: true,
        });
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        // 값 미리 계산 (최적화)
        const currentHour = hourRef.current;
        const values = new Float32Array(currentFeatures.length);
        let maxVal = 1;

        // getPopulationValue 인라인 최적화 (함수 호출 비용 감소)
        for (let i = 0; i < currentFeatures.length; i++) {
          const feature = currentFeatures[i];
          let val = 0;
          const hourData = feature.hourly_data?.find(
            (h) => h.hour === currentHour,
          );
          if (hourData) {
            if (genderFilter === 'all' && ageFilter === 'all') {
              val = hourData.sum_population ?? hourData.avg_population ?? 0;
            } else if (genderFilter !== 'all' && ageFilter === 'all') {
              val =
                genderFilter === 'male'
                  ? (hourData.male_total ?? 0)
                  : (hourData.female_total ?? 0);
            } else {
              const ageKey = AGE_FILTER_TO_KEY[ageFilter];
              val = ((hourData as any)[ageKey] as number) ?? 0;
            }
          }
          values[i] = val;
          if (val > maxVal) maxVal = val;
        }

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
        const offsetX = (fullWidth * (BUFFER_RATIO - 1)) / 2;
        const offsetY = (fullHeight * (BUFFER_RATIO - 1)) / 2;

        currentFeatures.forEach((f, idx) => {
          if (!f.center) return;
          const latlng = new window.kakao.maps.LatLng(
            f.center.lat,
            f.center.lng,
          );
          const pos = projection.containerPointFromCoords(latlng);

          if (
            !pos ||
            pos.x < -100 ||
            pos.x > fullWidth + 100 ||
            pos.y < -100 ||
            pos.y > fullHeight + 100
          )
            return;

          const baseX = (pos.x + offsetX) * DOWNSAMPLE;
          const baseY = (pos.y + offsetY) * DOWNSAMPLE;

          const value = values[idx];
          const weight = value / maxVal;
          if (weight <= 0.0001) return;

          let cellHash = 0;
          const len = f.cell_id.length;
          for (let j = 0; j < len; j++) {
            cellHash =
              ((cellHash << 5) - cellHash + f.cell_id.charCodeAt(j)) | 0;
          }

          const baseScale = 0.5 + weight * 1.5;
          const intensityAlpha =
            weight * config.intensity * (0.8 + (1 - baseScale) * 0.5);
          const finalAlpha = intensityAlpha > 0.5 ? 0.5 : intensityAlpha;

          // 스타일 미리 설정
          const varianceBase = config.radius * baseScale;

          for (let i = 0; i < config.points; i++) {
            let px = baseX;
            let py = baseY;

            if (i > 0) {
              const seedA = cellHash + i * 1337.5;
              const seedB = cellHash + i * 2187.3;
              const randomAngle =
                (Math.abs(Math.sin(seedA) * 10000) % 1) * 6.28318;
              const randomDist =
                (Math.abs(Math.cos(seedB) * 10000) % 1) * config.spread;
              px += Math.cos(randomAngle) * randomDist;
              py += Math.sin(randomAngle) * randomDist;
            }

            if (px < -50 || px > width + 50 || py < -50 || py > height + 50)
              continue;

            const variance =
              1 +
              ((Math.abs(Math.sin((cellHash + i * 1337.5) * 3)) % 1) * 0.3 -
                0.15);
            const currentRadius = varianceBase * variance;

            const grad = ctx.createRadialGradient(
              px,
              py,
              0,
              px,
              py,
              currentRadius,
            );
            grad.addColorStop(0, 'rgba(0,0,0,' + finalAlpha + ')');
            grad.addColorStop(0.4, 'rgba(0,0,0,' + finalAlpha * 0.4 + ')');
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, currentRadius, 0, 6.28318);
            ctx.fill();
            drawnCount++;
          }
        });

        if (drawnCount > 0) {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          const len = data.length;
          for (let i = 0; i < len; i += 4) {
            const alpha = data[i + 3];
            if (alpha > 3) {
              const baseIdx = alpha * 3;
              data[i] = colorPalette[baseIdx];
              data[i + 1] = colorPalette[baseIdx + 1];
              data[i + 2] = colorPalette[baseIdx + 2];
              data[i + 3] = alpha * 0.7;
            } else {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
      } catch (e) {
        console.error('[usePopulationLayer] Render error:', e);
      }
    });

    // 의존성에서 hour 제거 (hourRef 사용)
  }, [map, genderFilter, ageFilter, containerId]);

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

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const params = new URLSearchParams({
          minLat: sw.getLat().toString(),
          minLng: sw.getLng().toString(),
          maxLat: ne.getLat().toString(),
          maxLng: ne.getLng().toString(),
        });

        const response = await fetch(
          `${API_BASE_URL}/floating-population/layer/hourly?${params.toString()}`,
          { signal: abortControllerRef.current.signal },
        );

        if (!response.ok) return;

        const data: HourlyLayerResponse = await response.json();
        if (!data || !isVisibleRef.current) return;

        const newFeatures = data.features.map((f) => {
          if (!f.center) {
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
          }
          return f;
        });

        featuresRef.current = newFeatures;
        renderLayer();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('[usePopulationLayer] Fetch error:', err);
      }
    },
    [renderLayer],
  );

  // 시간 변경 시 renderLayer만 직접 호출 (fetchData 호출 방지)
  useEffect(() => {
    if (isVisible) renderLayer();
    // cleanup raf
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hour, genderFilter, ageFilter, isVisible, renderLayer]);

  // 나머지 필터 변경 시에도 renderLayer 호출 (위 useEffect에서 처리됨)

  // 지도 이동 시에만 fetchData 호출
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

            if (debounceTimerRef.current)
              clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              if (isVisibleRef.current) fetchData(map);
            }, 300);
          }),
        );
        listeners.push(
          eventApi.addListener(map, 'zoom_changed', () => {
            featuresRef.current = [];
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
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
        } catch {
          /* ignore */
        }
      });
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [map, renderLayer, fetchData, isVisible]);
};
