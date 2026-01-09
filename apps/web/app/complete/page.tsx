"use client";

import { useRouter } from "next/navigation";

import { CompletePage } from "@/components/CompletePage";
import { useAppStore } from "@/store/use-app-store";

export default function Page() {
  const router = useRouter();
  const reset = useAppStore((state) => state.reset);

  return (
    <CompletePage
      onRestart={() => {
        reset();
        router.push("/");
      }}
    />
  );
}
