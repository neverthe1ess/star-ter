"use client";

import { useRouter } from "next/navigation";

import { OnboardingPage, type OnboardingData } from "@/components/OnboardingPage";
import { updateOnboarding } from "@/services/user/user.api";

export default function Page() {
  const router = useRouter();
  return (
    <OnboardingPage
      onComplete={async (data: OnboardingData) => {
        await updateOnboarding(data);
        router.push("/locations");
      }}
      onBack={() => router.push("/onboarding/intro")}
      onSkip={async (data) => {
        await updateOnboarding(data);
        router.push("/locations");
      }}
    />
  );
}
