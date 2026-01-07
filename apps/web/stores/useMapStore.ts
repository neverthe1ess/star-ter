import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MapStore,
  SelectedArea,
  InfoBarData,
  RealEstateItem,
} from '../types/map-store-types';

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
      viewMode: 'analysis',
      selectedIndustryCodes: null,
      selectedIndustryName: null,
      markers: [],
      highlightedAreaName: null,
      selectedArea: null,
      isInfoBarOpen: false,
      selectedRealEstateItem: null,
      realEstateList: [],
      hoveredRealEstateItemId: null,
      filteredClusterCoords: null,
      hasHydrated: false,

      setCenter: (coords) => set({ center: coords }),
      setZoom: (level) => set({ zoom: level }),
      setSearchedLocation: (location) => set({ searchedLocation: location }),
      setIsMoving: (moving) => set({ isMoving: moving }),
      setIsMapIdle: (idle) => set({ isMapIdle: idle }),
      setOverlayMode: (mode) => set({ overlayMode: mode }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSelectedIndustryCodes: (codes) =>
        set({ selectedIndustryCodes: codes }),
      setSelectedIndustryName: (name) => set({ selectedIndustryName: name }),
      setHighlightedAreaName: (name) => set({ highlightedAreaName: name }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setSelectedRealEstateItem: (item) =>
        set({ selectedRealEstateItem: item }),
      setRealEstateList: (list: RealEstateItem[]) =>
        set({ realEstateList: list }),
      setHoveredRealEstateItemId: (id) => set({ hoveredRealEstateItemId: id }),
      setFilteredClusterCoords: (coords) =>
        set({ filteredClusterCoords: coords }),
      setInfoBarOpen: (isOpen) => set({ isInfoBarOpen: isOpen }),
      isBottomBarOpen: true,
      setBottomBarOpen: (isOpen) => set({ isBottomBarOpen: isOpen }),

      // 신규: 지역 선택 핸들러 (랜딩페이지 및 지도 클릭 대응)
      selectArea: (area: SelectedArea, fullData?: InfoBarData) => {
        const zoomLevel = ZOOM_LEVELS[area.type] || 5;

        set({
          center: area.coords,
          zoom: zoomLevel,
          selectedArea: { ...area, fullData },
          searchedLocation: area.name,
          highlightedAreaName: area.name,
          isInfoBarOpen: true,
          isMoving: true,
          // 상권 선택 시 부동산 관련 상태 초기화
          selectedRealEstateItem: null,
          viewMode: 'analysis',
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

      clearSelection: () =>
        set({
          selectedArea: null,
          isInfoBarOpen: false,
          highlightedAreaName: null,
        }),

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
          isInfoBarOpen: false,
        }),
    }),
    {
      name: 'map-storage',
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true);
      },
      // UI 상태 등은 저장하지 않음
      partialize: (state) => ({
        center: state.center,
        zoom: state.zoom,
        overlayMode: state.overlayMode,
        selectedIndustryCodes: state.selectedIndustryCodes,
        selectedIndustryName: state.selectedIndustryName,
        selectedArea: state.selectedArea,
        highlightedAreaName: state.highlightedAreaName,
        searchedLocation: state.searchedLocation,
      }),
    },
  ),
);
