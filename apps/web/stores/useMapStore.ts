import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MapStore, SelectedArea } from '../types/map-store-types';

const ZOOM_LEVELS = {
  gu: 8,
  dong: 5,
  commercial: 3,
};

export const useMapStore = create<MapStore>()(
  persist(
    (set) => ({
      center: null,
      zoom: 5,
      searchedLocation: null,
      isMoving: false,
      isMapIdle: true,
      overlayMode: 'revenue',
      selectedIndustryCodes: null,
      markers: [],
      highlightedAreaName: null,
      selectedArea: null,
      hasHydrated: false,

      setCenter: (coords) => set({ center: coords }),
      setZoom: (level) => set({ zoom: level }),
      setSearchedLocation: (location) => set({ searchedLocation: location }),
      setIsMoving: (moving) => set({ isMoving: moving }),
      setIsMapIdle: (idle) => set({ isMapIdle: idle }),
      setOverlayMode: (mode) => set({ overlayMode: mode }),
      setSelectedIndustryCodes: (codes) =>
        set({ selectedIndustryCodes: codes }),
      setHighlightedAreaName: (name) => set({ highlightedAreaName: name }),
      setHasHydrated: (state) => set({ hasHydrated: state }),

      // 신규: 지역 선택 핸들러 (랜딩페이지용)
      selectArea: (area: SelectedArea) => {
        const zoomLevel = ZOOM_LEVELS[area.type];

        set({
          center: area.coords,
          zoom: zoomLevel,
          selectedArea: area,
          searchedLocation: area.name,
          highlightedAreaName: area.name,
          isMoving: true,
          markers: [
            {
              id: 'selected',
              coords: area.coords,
              name: area.name,
              style: 'pulse',
            },
          ],
        });

        setTimeout(() => set({ isMoving: false }), 800);
      },

      // 기존: 좌표 기반 이동 핸들러 (호환성 유지)
      moveToLocation: (coords, location, zoom = 5) => {
        set({
          center: coords,
          zoom: zoom,
          searchedLocation: location,
          highlightedAreaName: location,
          isMoving: true,
          markers: [{ id: '1', coords, name: location, style: 'pulse' }],
        });

        setTimeout(() => set({ isMoving: false }), 1000);
      },

      moveToLocations: (locations) => {
        if (locations.length === 0) return;
        const avgLat =
          locations.reduce((sum, loc) => sum + loc.coords.lat, 0) /
          locations.length;
        const avgLng =
          locations.reduce((sum, loc) => sum + loc.coords.lng, 0) /
          locations.length;

        set({
          center: { lat: avgLat, lng: avgLng },
          zoom: -1,
          searchedLocation: locations.map((l) => l.name).join(', '),
          highlightedAreaName: locations[0].name,
          isMoving: true,
          markers: locations,
        });

        setTimeout(() => set({ isMoving: false }), 1000);
      },

      clearMarkers: () => set({ markers: [] }),

      reset: () =>
        set({
          center: null,
          zoom: 5,
          searchedLocation: null,
          isMoving: false,
          markers: [],
          highlightedAreaName: null,
          selectedArea: null,
        }),
    }),
    {
      name: 'map-storage',
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    },
  ),
);
