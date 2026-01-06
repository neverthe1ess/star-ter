import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  width: number;
  isResizing: boolean;

  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setWidth: (width: number) => void;
  setIsResizing: (isResizing: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  width: 400,
  isResizing: false,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
  setWidth: (width) => set({ width }),
  setIsResizing: (isResizing) => set({ isResizing }),
}));
