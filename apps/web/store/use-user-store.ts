"use client";

import { create } from "zustand";

export type UserData = {
  age: string;
  region: string;
  operatingTime: string;
  capital: string;
};

export type AuthUser = {
  id?: string;
  nickname?: string;
};

type UserState = {
  userData: UserData | null;
  authUser: AuthUser | null;
  setUserData: (data: UserData) => void;
  resetUserData: () => void;
  setAuthUser: (user: AuthUser | null) => void;
  clearAuthUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  userData: null,
  authUser: null,
  setUserData: (data) => set({ userData: data }),
  resetUserData: () => set({ userData: null }),
  setAuthUser: (user) => set({ authUser: user }),
  clearAuthUser: () => set({ authUser: null }),
}));
