"use client";

import { useRouter } from "next/navigation";

import { OnboardingPage } from "@/components/OnboardingPage";
import type { OnboardingData } from "@/components/onboarding/onboarding-options";
import { updateOnboarding } from "@/services/user/user.api";

export default function Page() {
  const router = useRouter();
  return (
    <OnboardingPage
      onComplete={async (data: OnboardingData) => {
        await updateOnboarding(data);
        router.push("/industry");
      }}
      onBack={() => router.push("/onboarding/intro")}
    />
  );
}
