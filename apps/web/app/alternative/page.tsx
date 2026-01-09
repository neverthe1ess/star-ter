"use client";

import { useRouter } from "next/navigation";

import { AlternativeLocationPage } from "@/components/AlternativeLocationPage";
import { DEFAULT_LOCATION, useAppStore } from "@/store/use-app-store";

export default function Page() {
  const router = useRouter();
  const selectedLocation = useAppStore((state) => state.selectedLocation);
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);

  const currentLocation = selectedLocation ?? DEFAULT_LOCATION;

  return (
    <AlternativeLocationPage
      currentLocation={currentLocation}
      onBack={() => router.push("/consult")}
      onSelectLocation={(location) => {
        setSelectedLocation({
          id: location.id,
          name: location.name,
          district: location.district,
          commercialScore: location.commercialScore,
          realEstateScore: location.realEstateScore,
          monthlyFootTraffic: location.monthlyFootTraffic,
          avgRent: location.avgRent,
          growthRate: location.growthRate,
          badge: "AI 추천",
          badgeType: "rapid",
          revenue: "상권 분석 중",
        });
        router.push("/locations/detail");
      }}
    />
  );
}
