'use client';

import React from 'react';
import AnalysisLayout from './AnalysisLayout';
import MapSection from './MapSection';
import InfoSection from './InfoSection';
import RealEstateInfoSection from '../real-estate/RealEstateInfoSection';
import { useMapStore } from '../../stores/useMapStore';

export default function AnalysisPageContainer() {
  const { viewMode } = useMapStore();

  return (
    <AnalysisLayout
      mapSection={<MapSection />}
      infoSection={
        viewMode === 'real-estate' ? <RealEstateInfoSection /> : <InfoSection />
      }
    />
  );
}
