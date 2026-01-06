import AnalysisLayout from '@/components/analysis/AnalysisLayout';
import MapSection from '@/components/analysis/MapSection';
import InfoSection from '@/components/analysis/InfoSection';

export default function AnalysisPage() {
  return (
    <AnalysisLayout
      mapSection={<MapSection />}
      infoSection={<InfoSection />}
    />
  );
}
