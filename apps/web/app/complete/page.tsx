"use client";

import { useRouter } from "next/navigation";

import { CompletePage } from "@/components/CompletePage";
import { useAppStore } from "@/store/use-app-store";
import { useUserStore } from "@/store/use-user-store";

export default function Page() {
  const router = useRouter();
  const reset = useAppStore((state) => state.reset);
  const resetUserData = useUserStore((state) => state.resetUserData);

  return (
    <CompletePage
      onRestart={() => {
        reset();
        resetUserData();
        router.push("/");
      }}
    />
  );
}
