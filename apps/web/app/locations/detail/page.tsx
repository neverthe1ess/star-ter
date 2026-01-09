"use client";

import { useRouter } from "next/navigation";

import { LocationDetailPage } from "@/components/LocationDetailPage";
import { DEFAULT_LOCATION, useAppStore } from "@/store/use-app-store";

export default function Page() {
  const router = useRouter();
  const selectedLocation = useAppStore((state) => state.selectedLocation);
  const location = selectedLocation ?? DEFAULT_LOCATION;

  return (
    <LocationDetailPage
      location={location}
      onBack={() => router.push("/locations")}
      onConsultAI={() => router.push("/consult")}
    />
  );
}
