"use client";

import { create } from "zustand";

// Create a store to manage shared state across components
export const useRefreshStore = create((set) => ({
  isRefreshing: false,
  lastRefresh: new Date(),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setLastRefresh: (lastRefresh) => set({ lastRefresh }),

  // Add shared data cache
  dataCache: {
    farmers: [],
    livestock: [],
    operators: [],
    crops: [],
    rice: [],
    highValueCrops: [],
    users: [], // Add users to the cache
  },

  // Method to update the data cache
  updateDataCache: (newData) =>
    set((state) => ({
      dataCache: {
        ...state.dataCache,
        ...newData,
      },
    })),

  // Method to clear the data cache
  clearDataCache: () =>
    set({
      dataCache: {
        farmers: [],
        livestock: [],
        operators: [],
        crops: [],
        rice: [],
        highValueCrops: [],
        users: [], // Include users in the reset
      },
    }),
}));
