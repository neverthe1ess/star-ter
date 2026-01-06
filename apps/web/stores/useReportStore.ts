import { create } from 'zustand';
import { ReportRequest } from '@/types/bottom-menu-types';

interface ReportStore {
  isOpen: boolean;
  reportRequest: ReportRequest | null;
  openReport: (request: ReportRequest) => void;
  closeReport: () => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  isOpen: false,
  reportRequest: null,
  openReport: (request) => set({ isOpen: true, reportRequest: request }),
  closeReport: () => set({ isOpen: false, reportRequest: null }),
}));
