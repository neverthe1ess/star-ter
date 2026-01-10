"use client";

import { useRouter } from "next/navigation";

import { LoginPage } from "@/components/LoginPage";
import { getOnboarding } from "@/services/user/user.api";

export default function Page() {
  const router = useRouter();

  return (
    <LoginPage
      onLogin={async () => {
        const onboarding = await getOnboarding();
        if (!onboarding || !onboarding.completed) {
          router.push("/onboarding/intro");
          return;
        }
        router.push("/locations");
      }}
    />
  );
}
