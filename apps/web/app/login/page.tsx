"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { LoginPage } from "@/components/LoginPage";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextPath =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("/login")
      ? nextParam
      : "/locations";

  return (
    <LoginPage
      onLogin={({ on_boarding_completed }) => {
        router.push(on_boarding_completed ? nextPath : "/onboarding/intro");
      }}
    />
  );
}
