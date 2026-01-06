'use client';

import AnalysisLayout from '@/components/analysis/AnalysisLayout';
import MapSection from '@/components/analysis/MapSection';
import InfoSection from '@/components/analysis/InfoSection';
import RealEstateInfoSection from '@/components/real-estate/RealEstateInfoSection';
import ComparisonOverlay from '@/components/comparison/ComparisonOverlay';
import { useComparisonStore } from '@/stores/useComparisonStore';
import { useMapStore } from '@/stores/useMapStore';

export default function AnalysisPage() {
  const { isVisible, dataA, dataB, closeComparison } = useComparisonStore();
  const { viewMode } = useMapStore();

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <AnalysisLayout
        mapSection={<MapSection />}
        infoSection={
          viewMode === 'real-estate' ? <RealEstateInfoSection /> : <InfoSection />
        }
      />
      
      {/* 상권 비교 오버레이 */}
      {isVisible && dataA && dataB && (
        <ComparisonOverlay
          isVisible={isVisible}
          onClose={closeComparison}
          dataA={dataA}
          dataB={dataB}
        />
      )}
    </div>
  );
}

