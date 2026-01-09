"use client";

import { useRouter } from "next/navigation";

import { IndustrySelectPage } from "@/components/IndustrySelectPage";
import { useAppStore } from "@/store/use-app-store";

export default function Page() {
  const router = useRouter();
  const setSelectedIndustry = useAppStore((state) => state.setSelectedIndustry);

  return (
    <IndustrySelectPage
      onSelect={(industry) => {
        setSelectedIndustry(industry);
        router.push("/locations");
      }}
      onBack={() => router.push("/onboarding")}
      onSkip={() => router.push("/locations")}
    />
  );
}
