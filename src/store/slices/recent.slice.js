function matchesDestination(item, destination) {
  return (
    item.countryCode === destination.countryCode && item.place === destination.place
  );
}

export const createRecentSlice = (set) => ({
  recentDestinations: [],
  addRecentDestination: (destination) =>
    set((state) => {
      const filtered = state.recentDestinations.filter(
        (item) => !matchesDestination(item, destination),
      );

      return {
        recentDestinations: [
          {
            ...destination,
            viewedAt: new Date().toISOString(),
          },
          ...filtered,
        ].slice(0, 10),
      };
    }),
  removeRecentDestination: (destination) =>
    set((state) => ({
      recentDestinations: state.recentDestinations.filter(
        (item) => !matchesDestination(item, destination),
      ),
    })),
  clearRecentDestinations: () => set({ recentDestinations: [] }),
});
