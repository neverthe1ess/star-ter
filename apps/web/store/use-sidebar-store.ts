import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isSidebarOpen: true, // 기본값은 열림
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: 'sidebar-storage', // 로컬 스토리지 키 이름
    }
  )
);
