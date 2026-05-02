export const createSearchSlice = (set) => ({
  searchQuery: "",
  recentSearches: [],
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  addRecentSearch: (value) =>
    set((state) => {
      const filtered = state.recentSearches.filter((item) => item !== value);
      return {
        recentSearches: [value, ...filtered].slice(0, 8),
      };
    }),
});

