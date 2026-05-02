export const createCompareSlice = (set) => ({
  compareDestinations: [],
  toggleCompareDestination: (destination) =>
    set((state) => {
      const exists = state.compareDestinations.some(
        (item) =>
          item.countryCode === destination.countryCode &&
          item.place === destination.place,
      );

      if (exists) {
        return {
          compareDestinations: state.compareDestinations.filter(
            (item) =>
              !(
                item.countryCode === destination.countryCode &&
                item.place === destination.place
              ),
          ),
        };
      }

      return {
        compareDestinations: [destination, ...state.compareDestinations].slice(0, 3),
      };
    }),
  clearCompareDestinations: () => set({ compareDestinations: [] }),
});

