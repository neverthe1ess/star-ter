'use client';

import AnalysisLayout from '@/components/analysis/AnalysisLayout';
import MapSection from '@/components/analysis/MapSection';
import InfoSection from '@/components/analysis/InfoSection';
import RealEstateInfoSection from '@/components/real-estate/RealEstateInfoSection';
import PopulationAnalysisView from '@/components/analysis/PopulationAnalysisView/PopulationAnalysisView';
import ComparisonOverlay from '@/components/comparison/ComparisonOverlay';
import ReportOverlay from '@/components/report-overlay/ReportOverlay';
import { useComparisonStore } from '@/stores/useComparisonStore';
import { useReportStore } from '@/stores/useReportStore';
import { useMapStore } from '@/stores/useMapStore';

export default function AnalysisPage() {
  const { isVisible, dataA, dataB, closeComparison } = useComparisonStore();
  const { isOpen: isReportOpen, reportRequest, closeReport } = useReportStore();
  const { viewMode } = useMapStore();

  // viewMode에 따른 InfoSection 렌더링
  const renderInfoSection = () => {
    switch (viewMode) {
      case 'real-estate':
        return <RealEstateInfoSection />;
      case 'population':
        return <PopulationAnalysisView />;
      default:
        return <InfoSection />;
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <AnalysisLayout
        mapSection={<MapSection />}
        infoSection={renderInfoSection()}
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

      {/* 보고서 오버레이 */}
      <ReportOverlay
        isVisible={isReportOpen}
        onClose={closeReport}
        userSelection={reportRequest}
      />
    </div>
  );
}
