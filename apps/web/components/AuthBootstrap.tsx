"use client";

import { useEffect } from "react";

import { getProfile } from "@/services/auth/auth.api";
import { useUserStore } from "@/store/use-user-store";

export function AuthBootstrap() {
  const authUser = useUserStore((state) => state.authUser);
  const setAuthUser = useUserStore((state) => state.setAuthUser);
  const clearAuthUser = useUserStore((state) => state.clearAuthUser);

  useEffect(() => {
    if (authUser) return;

    let cancelled = false;
    getProfile()
      .then((profile) => {
        if (!cancelled) {
          setAuthUser({ id: profile.id, nickname: profile.nickname });
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearAuthUser();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authUser, setAuthUser, clearAuthUser]);

  return null;
}
