import { create } from "zustand";

// Create a global store for shared state across components
export const useRefreshStore = create((set) => ({
  isRefreshing: false,
  lastRefresh: new Date(),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setLastRefresh: (lastRefresh) => set({ lastRefresh }),
}));
