import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createCompareSlice } from "./slices/compare.slice";
import { createFiltersSlice } from "./slices/filters.slice";
import { createRecentSlice } from "./slices/recent.slice";
import { createSavedSlice } from "./slices/saved.slice";
import { createSearchSlice } from "./slices/search.slice";
import { createUiSlice } from "./slices/ui.slice";

export const useAppStore = create(
  persist(
    (...args) => ({
      ...createUiSlice(...args),
      ...createSavedSlice(...args),
      ...createCompareSlice(...args),
      ...createRecentSlice(...args),
      ...createFiltersSlice(...args),
      ...createSearchSlice(...args),
    }),
    {
      name: "e-trav-desk-store",
      partialize: (state) => ({
        theme: state.theme,
        savedDestinations: state.savedDestinations,
        journeys: state.journeys,
        savedPlannerPreferences: state.savedPlannerPreferences,
        compareDestinations: state.compareDestinations,
        recentDestinations: state.recentDestinations,
        activeRegion: state.activeRegion,
        recentSearches: state.recentSearches,
      }),
    },
  ),
);
