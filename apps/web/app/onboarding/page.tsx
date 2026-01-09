"use client";

import { useRouter } from "next/navigation";

import { OnboardingPage } from "@/components/OnboardingPage";
import { useUserStore } from "@/store/use-user-store";

export default function Page() {
  const router = useRouter();
  const setUserData = useUserStore((state) => state.setUserData);

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
