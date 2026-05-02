export const createFiltersSlice = (set) => ({
  activeRegion: "all",
  setActiveRegion: (region) => set({ activeRegion: region }),
});

