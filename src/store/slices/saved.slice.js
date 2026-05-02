const journeyAccents = ["neon", "aurora", "coral"];

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

function buildDefaultPlannerPreferences() {
  return {
    profileId: "warm-dry",
    mode: "exact-month",
    selectedMonth: getCurrentMonth(),
    windowSize: 2,
  };
}

function matchesDestination(item, destination) {
  return (
    item.countryCode === destination.countryCode && item.place === destination.place
  );
}

function normalizeDestination(destination) {
  return {
    countryCode: destination.countryCode,
    country: destination.country,
    place: destination.place,
    lat: destination.lat,
    lng: destination.lng,
    flag: destination.flag,
    savedAt: destination.savedAt || new Date().toISOString(),
    pinned: destination.pinned ?? false,
    note: destination.note ?? "",
    tags: destination.tags ?? [],
    journeyId: destination.journeyId ?? "",
  };
}

function createJourney(name, index) {
  const trimmed = name.trim();

  if (!trimmed) {
    return null;
  }

  return {
    id: `${Date.now()}-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: trimmed,
    accent: journeyAccents[index % journeyAccents.length],
    createdAt: new Date().toISOString(),
    planningPreferences: null,
  };
}

export const createSavedSlice = (set) => ({
  savedDestinations: [],
  journeys: [],
  savedPlannerPreferences: buildDefaultPlannerPreferences(),
  toggleSavedDestination: (destination) =>
    set((state) => {
      const exists = state.savedDestinations.some((item) =>
        matchesDestination(item, destination),
      );

      return {
        savedDestinations: exists
          ? state.savedDestinations.filter(
              (item) => !matchesDestination(item, destination),
            )
          : [normalizeDestination(destination), ...state.savedDestinations].slice(
              0,
              18,
            ),
      };
    }),
  togglePinnedDestination: (destination) =>
    set((state) => ({
      savedDestinations: state.savedDestinations.map((item) =>
        matchesDestination(item, destination)
          ? { ...item, pinned: !(item.pinned ?? false) }
          : item,
      ),
    })),
  setSavedDestinationNote: (destination, note) =>
    set((state) => ({
      savedDestinations: state.savedDestinations.map((item) =>
        matchesDestination(item, destination) ? { ...item, note } : item,
      ),
    })),
  addSavedDestinationTag: (destination, tag) =>
    set((state) => {
      const normalizedTag = tag.trim();

      if (!normalizedTag) {
        return state;
      }

      return {
        savedDestinations: state.savedDestinations.map((item) => {
          if (!matchesDestination(item, destination)) {
            return item;
          }

          const existingTags = item.tags ?? [];

          if (
            existingTags.some(
              (currentTag) =>
                currentTag.toLowerCase() === normalizedTag.toLowerCase(),
            )
          ) {
            return item;
          }

          return { ...item, tags: [...existingTags, normalizedTag].slice(0, 6) };
        }),
      };
    }),
  removeSavedDestinationTag: (destination, tag) =>
    set((state) => ({
      savedDestinations: state.savedDestinations.map((item) =>
        matchesDestination(item, destination)
          ? {
              ...item,
              tags: (item.tags ?? []).filter((currentTag) => currentTag !== tag),
            }
          : item,
      ),
    })),
  createJourney: (name) =>
    set((state) => {
      const journey = createJourney(name, state.journeys.length);

      if (!journey) {
        return state;
      }

      const exists = state.journeys.some(
        (item) => item.name.toLowerCase() === journey.name.toLowerCase(),
      );

      if (exists) {
        return state;
      }

      return {
        journeys: [journey, ...state.journeys].slice(0, 8),
      };
    }),
  deleteJourney: (journeyId) =>
    set((state) => ({
      journeys: state.journeys.filter((journey) => journey.id !== journeyId),
      savedDestinations: state.savedDestinations.map((item) =>
        item.journeyId === journeyId ? { ...item, journeyId: "" } : item,
      ),
    })),
  assignDestinationToJourney: (destination, journeyId) =>
    set((state) => ({
      savedDestinations: state.savedDestinations.map((item) =>
        matchesDestination(item, destination)
          ? { ...item, journeyId: journeyId || "" }
          : item,
      ),
    })),
  setSavedPlannerPreferences: (updates) =>
    set((state) => ({
      savedPlannerPreferences: {
        ...state.savedPlannerPreferences,
        ...updates,
      },
    })),
  saveJourneyPlanningPreferences: (journeyId, preferences) =>
    set((state) => ({
      journeys: state.journeys.map((journey) =>
        journey.id === journeyId
          ? {
              ...journey,
              planningPreferences: {
                ...state.savedPlannerPreferences,
                ...(journey.planningPreferences ?? {}),
                ...preferences,
              },
            }
          : journey,
      ),
    })),
});
