"use client";

import { useRouter } from "next/navigation";

import { RealEstatePage } from "@/components/RealEstatePage";
import { DEFAULT_LOCATION, useAppStore } from "@/store/use-app-store";

export default function Page() {
  const router = useRouter();
  const selectedLocation = useAppStore((state) => state.selectedLocation);
  const setSelectedProperty = useAppStore((state) => state.setSelectedProperty);
  const location = selectedLocation ?? DEFAULT_LOCATION;

  return (
    <RealEstatePage
      location={location}
      onBack={() => router.push("/consult")}
      onCalculateBreakeven={(property) => {
        setSelectedProperty(property);
        router.push("/breakeven");
      }}
    />
  );
}
