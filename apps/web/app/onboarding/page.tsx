"use client";

import { useRouter } from "next/navigation";

import { OnboardingPage } from "@/components/OnboardingPage";
import { useAppStore } from "@/store/use-app-store";

export default function Page() {
  const router = useRouter();
  const setUserData = useAppStore((state) => state.setUserData);

  return (
    <OnboardingPage
      onComplete={(data) => {
        setUserData(data);
        router.push("/industry");
      }}
      onBack={() => router.push("/onboarding/intro")}
    />
  );
}
