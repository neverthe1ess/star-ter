"use client";

import { useRouter } from "next/navigation";
import { LocationSearchPage } from "@/components/LocationSearchPage";

export default function Page() {
  const router = useRouter();

  return (
    <LocationSearchPage
      onBack={() => router.push("/locations")}
    />
  );
}
