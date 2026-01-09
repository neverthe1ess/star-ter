"use client";

import { useRouter } from "next/navigation";

import { LocationSearchPage } from "@/components/LocationSearchPage";
import { useAppStore } from "@/store/use-app-store";

export default function Page() {
  const router = useRouter();
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);

  return (
    <LocationSearchPage
      onBack={() => router.push("/locations")}
      onSelectLocation={(item) => {
        const [districtName, categoryName] = item.district
          .split("·")
          .map((part: string) => part.trim());
        const badgeType =
          item.statusType === "hot"
            ? "explosive"
            : item.statusType === "stable"
            ? "stable"
            : "rapid";

        setSelectedLocation({
          id: item.id,
          name: item.name,
          district: districtName || item.district,
          category: categoryName || "카페",
          revenue: item.totalRevenue || item.revenue,
          growthRate: item.growthRate,
          badge: item.status || "상권 분석",
          badgeType,
          imageUrl: item.imageUrl,
        });
        router.push("/locations/detail");
      }}
    />
  );
}
