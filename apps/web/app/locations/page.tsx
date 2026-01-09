"use client";

import { useRouter } from "next/navigation";

import { LocationListPage } from "@/components/LocationListPage";
import { useAppStore } from "@/store/use-app-store";

export default function Page() {
  const router = useRouter();
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);

  return (
    <LocationListPage
      onSelectLocation={(location) => {
        setSelectedLocation(location);
        router.push("/locations/detail");
      }}
    />
  );
}
