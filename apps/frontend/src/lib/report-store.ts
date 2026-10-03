import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BugReport {
  id: string;
  date: string;
  name: string;
  email: string;
  movieId: string;
  movieTitle: string;
  message: string;
  status: 'Pending' | 'Resolved';
}

interface ReportState {
  reports: BugReport[];
  unreadCount: number;
  addReport: (report: Omit<BugReport, 'id' | 'date' | 'status'>) => void;
  markAsResolved: (id: string) => void;
  deleteReport: (id: string) => void;
  clearUnreadCount: () => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      reports: [],
      unreadCount: 0,
      addReport: (newReport) =>
        set((state) => {
          const report: BugReport = {
            ...newReport,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status: 'Pending',
          };
          return {
            reports: [report, ...state.reports],
            unreadCount: state.unreadCount + 1,
          };
        }),
      markAsResolved: (id) =>
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id ? { ...r, status: 'Resolved' } : r
          ),
        })),
      deleteReport: (id) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== id),
        })),
      clearUnreadCount: () =>
        set(() => ({
          unreadCount: 0,
        })),
    }),
    {
      name: 'lalakon-report-storage',
    }
  )
);
