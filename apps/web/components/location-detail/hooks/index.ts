// location-detail/hooks 폴더의 public exports
// 다른 파일에서 import할 때 간편하게 사용 가능:
// import { useVitalityData, useStoreLocations, useCompetitionOverlay } from './hooks';

export { useVitalityData, type VitalityData } from './useVitalityData';
export { useStoreLocations, type StoreLocation } from './useStoreLocations';
export {
  useCompetitionOverlay,
  type CompetitionZone,
} from './useCompetitionOverlay';
