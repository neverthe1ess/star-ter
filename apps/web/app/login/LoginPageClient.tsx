"use client";

import { useRouter } from "next/navigation";

import { LoginPage } from "@/components/LoginPage";

type LoginPageClientProps = {
  nextPath: string;
};

export function LoginPageClient({ nextPath }: LoginPageClientProps) {
  const router = useRouter();

  return (
    <LoginPage
      onLogin={({ on_boarding_completed }) => {
        router.push(on_boarding_completed ? nextPath : "/onboarding/intro");
      }}
    />
  );
}
