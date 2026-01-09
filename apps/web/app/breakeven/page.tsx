"use client";

import { useRouter } from "next/navigation";

import { BreakevenPage } from "@/components/BreakevenPage";
import { DEFAULT_LOCATION, DEFAULT_PROPERTY, useAppStore } from "@/store/use-app-store";

export default function Page() {
  const router = useRouter();
  const selectedLocation = useAppStore((state) => state.selectedLocation);
  const selectedProperty = useAppStore((state) => state.selectedProperty);

  const location = selectedLocation ?? DEFAULT_LOCATION;
  const property = selectedProperty ?? DEFAULT_PROPERTY;

  return (
    <BreakevenPage
      location={location}
      property={property}
      onBack={() => router.push("/real-estate")}
      onComplete={() => router.push("/complete")}
    />
  );
}
