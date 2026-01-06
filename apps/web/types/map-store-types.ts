export type OverlayMode = 'revenue' | 'population' | 'opening' | 'shutting';

export type AreaType = 'gu' | 'dong' | 'commercial';

export type ViewMode = 'analysis' | 'real-estate';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  coords: MapCoordinates;
  name: string;
  style?: 'default' | 'pulse';
}

export type InfoBarData = {
  adm_nm?: string;
  adm_cd?: string;
  buld_nm?: string;
  commercialName?: string;
  commercialType?: string;
  commercialCode?: string;
  signgu_cd?: string;
  adstrd_cd?: string;
  x: string | number;
  y: string | number;
  polygons?: number[][][][] | number[][][] | number[][];
  level?: AreaType;
};

// 선택된 지역 정보 (랜딩페이지에서 전달)
export interface SelectedArea {
  name: string;
  coords: MapCoordinates;
  type: AreaType;
  code?: string; // 행정동 코드(adstrd_cd) 또는 상권 코드(trdar_cd)
}

export interface RealEstateItem {
  id: string;
  name: string | null;
  address: string | null;
  roadaddress: string | null;
  centerlatitude: number | null;
  centerlongitude: number | null;
  previewphotourl: string | null;
  smallphotourls: string | null;
  originphotourls: string | null;
  businesslargecodename: string | null;
  businessmiddlecodename: string | null;
  deposit: number | null;
  monthlyrent: number | null;
  premium: number | null;
  maintenancefee: number | null;
  floor: number | null;
  groundfloor: number | null;
  size: number | null;
  title: string | null;
  nearsubwaystation: string | null;
  ismoveindate: boolean | null;
  moveindate: string | null;
  createddateutc: string | null;
  editeddateutc: string | null;
  areaprice: number | null;
}

export interface MapStore {
  // 상태
  center: MapCoordinates | null;
  zoom: number;
  searchedLocation: string | null; // 이름 기반 검색어 (호환성 유지)
  isMoving: boolean;
  isMapIdle: boolean;
  overlayMode: OverlayMode;
  viewMode: ViewMode;
  selectedIndustryCodes: string[] | null;
  markers: MapMarker[];
  highlightedAreaName: string | null;

  // 신규: 선별된 지역 정보
  selectedArea: (SelectedArea & { fullData?: InfoBarData }) | null;
  isInfoBarOpen: boolean;

  // 신규: 선택된 부동산 매물
  selectedRealEstateItem: RealEstateItem | null;
  // 신규: 현재 보고 있는 지역의 부동산 매물 리스트
  realEstateList: RealEstateItem[];
  // 신규: 리스트 호버 상태
  hoveredRealEstateItemId: string | null;
  // 신규: 클러스터 필터링 좌표 (클릭한 클러스터의 좌표)
  // 신규: 클러스터 필터링 좌표 (클릭한 클러스터의 좌표)
  filteredClusterCoords: { lat: number; lng: number } | null;
  // 신규: 하단 바 상태
  isBottomBarOpen: boolean;

  hasHydrated: boolean;

  // 액션
  setCenter: (coords: MapCoordinates) => void;
  setZoom: (level: number) => void;
  setSearchedLocation: (location: string | null) => void;
  setIsMoving: (moving: boolean) => void;
  setIsMapIdle: (idle: boolean) => void;
  setOverlayMode: (mode: OverlayMode) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedIndustryCodes: (codes: string[] | null) => void;
  setHighlightedAreaName: (name: string | null) => void;
  setHasHydrated: (state: boolean) => void;
  setSelectedRealEstateItem: (item: RealEstateItem | null) => void;
  setRealEstateList: (list: RealEstateItem[]) => void;
  setHoveredRealEstateItemId: (id: string | null) => void;
  setFilteredClusterCoords: (
    coords: { lat: number; lng: number } | null,
  ) => void;
  setBottomBarOpen: (isOpen: boolean) => void;

  // 상권/행정구역 선택 (줌 레벨 자동 설정)
  selectArea: (area: SelectedArea, fullData?: InfoBarData) => void;
  setInfoBarOpen: (isOpen: boolean) => void;
  clearSelection: () => void;

  // 기존 이동 함수 (호환성 유지)
  moveToLocation: (
    coords: MapCoordinates,
    location: string,
    zoom?: number,
    centered?: boolean,
  ) => void;
  moveToLocations: (locations: MapMarker[]) => void;

  clearMarkers: () => void;
  reset: () => void;
}
