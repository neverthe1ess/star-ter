"use client";

import { create } from "zustand";

export type AuthUser = {
  id?: string;
  nickname?: string;
  profileImageKey?: string | null;
};

type UserState = {
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  clearAuthUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  authUser: null,
  setAuthUser: (user) => set({ authUser: user }),
  clearAuthUser: () => set({ authUser: null }),
}));
