import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { SelectField } from "../components/ui/SelectField";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ShellCard } from "../components/ui/ShellCard";
import { Skeleton } from "../components/ui/Skeleton";
import { JourneyBoard } from "../features/saved/components/JourneyBoard";
import { RecentDestinationsPanel } from "../features/saved/components/RecentDestinationsPanel";
import { SavedPlanningDesk } from "../features/saved/components/SavedPlanningDesk";
import { SavedOverview } from "../features/saved/components/SavedOverview";
import { SavedWorkspaceCard } from "../features/saved/components/SavedWorkspaceCard";
import {
  buildSavedPlanningChartData,
  buildSavedPlanningEntries,
  buildSavedPlanningSummary,
  buildJourneyMetrics,
  buildRecentCards,
  buildSavedCard,
} from "../features/saved/saved.utils";
import { buildRiskBbox, buildRiskSnapshot } from "../lib/risk";
import { TRAVEL_PROFILE_OPTIONS } from "../lib/scoring/travelProfileScore";
import { buildTravelWindowPlan } from "../lib/scoring/travelWindowScore";
import { buildSeasonalityDateRange } from "../lib/seasonality";
import { getAllCountries } from "../services/api/countries.api";
import { getNearbyEvents } from "../services/api/eonet.api";
import { getForecast, getHistoricalDailyWeather } from "../services/api/openMeteo.api";
import { mapRiskEvents } from "../services/mappers/risk.mapper";
import { mapHistoricalSeasonalityProfile } from "../services/mappers/seasonality.mapper";
import { queryKeys } from "../services/query/queryKeys";
import { useAppStore } from "../store/useAppStore";

function normalizeSavedProfile(value) {
  return TRAVEL_PROFILE_OPTIONS.some((option) => option.value === value)
    ? value
    : null;
}

function normalizeSavedMode(value) {
  return value === "best-window" || value === "exact-month" ? value : null;
}

function normalizeSavedMonth(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 12 ? numeric : null;
}

function normalizeSavedWindow(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 3 ? numeric : null;
}

export function SavedPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [scope, setScope] = useState(() => searchParams.get("scope") ?? "all");
  const [hasSeededUrlState, setHasSeededUrlState] = useState(false);
  const historicalRange = useMemo(() => buildSeasonalityDateRange(), []);
  const riskWindowDays = 21;
  const savedDestinations = useAppStore((state) => state.savedDestinations);
  const journeys = useAppStore((state) => state.journeys);
  const savedPlannerPreferences = useAppStore(
    (state) => state.savedPlannerPreferences,
  );
  const recentDestinations = useAppStore((state) => state.recentDestinations);
  const createJourney = useAppStore((state) => state.createJourney);
  const deleteJourney = useAppStore((state) => state.deleteJourney);
  const setSavedPlannerPreferences = useAppStore(
    (state) => state.setSavedPlannerPreferences,
  );
  const saveJourneyPlanningPreferences = useAppStore(
    (state) => state.saveJourneyPlanningPreferences,
  );
  const removeRecentDestination = useAppStore(
    (state) => state.removeRecentDestination,
  );
  const clearRecentDestinations = useAppStore(
    (state) => state.clearRecentDestinations,
  );

  useEffect(() => {
    const updates = {};
    const profileId = normalizeSavedProfile(searchParams.get("profile"));
    const mode = normalizeSavedMode(searchParams.get("mode"));
    const selectedMonth = normalizeSavedMonth(searchParams.get("month"));
    const windowSize = normalizeSavedWindow(searchParams.get("window"));

    if (profileId) {
      updates.profileId = profileId;
    }

    if (mode) {
      updates.mode = mode;
    }

    if (selectedMonth) {
      updates.selectedMonth = selectedMonth;
    }

    if (windowSize) {
      updates.windowSize = windowSize;
    }

    if (Object.keys(updates).length) {
      setSavedPlannerPreferences(updates);
    }
    setHasSeededUrlState(true);
  }, [searchParams, setSavedPlannerPreferences]);

  useEffect(() => {
    if (!hasSeededUrlState) {
      return;
    }

    const nextParams = new URLSearchParams();

    if (query.trim()) {
      nextParams.set("q", query.trim());
    }

    if (scope !== "all") {
      nextParams.set("scope", scope);
    }

    nextParams.set("profile", savedPlannerPreferences.profileId);
    nextParams.set("mode", savedPlannerPreferences.mode);
    nextParams.set("month", String(savedPlannerPreferences.selectedMonth));
    nextParams.set("window", String(savedPlannerPreferences.windowSize));

    setSearchParams(nextParams, { replace: true });
  }, [
    hasSeededUrlState,
    query,
    savedPlannerPreferences.mode,
    savedPlannerPreferences.profileId,
    savedPlannerPreferences.selectedMonth,
    savedPlannerPreferences.windowSize,
    scope,
    setSearchParams,
  ]);

  const countriesQuery = useQuery({
    queryKey: queryKeys.countries,
    queryFn: getAllCountries,
  });

  const weatherQueries = useQueries({
    queries: savedDestinations.map((destination) => ({
      queryKey: queryKeys.forecast(destination.lat, destination.lng),
      queryFn: () => getForecast(destination.lat, destination.lng),
      enabled: Number.isFinite(destination.lat) && Number.isFinite(destination.lng),
    })),
  });

  const historicalWeatherQueries = useQueries({
    queries: savedDestinations.map((destination) => ({
      queryKey: queryKeys.historicalWeather(
        destination.lat,
        destination.lng,
        historicalRange.startDate,
        historicalRange.endDate,
        "auto",
      ),
      queryFn: () =>
        getHistoricalDailyWeather(destination.lat, destination.lng, {
          startDate: historicalRange.startDate,
          endDate: historicalRange.endDate,
          timezone: "auto",
        }),
      enabled: Number.isFinite(destination.lat) && Number.isFinite(destination.lng),
      staleTime: 1000 * 60 * 60 * 24,
    })),
  });

  const riskQueries = useQueries({
    queries: savedDestinations.map((destination) => {
      const hasCoords =
        Number.isFinite(destination.lat) && Number.isFinite(destination.lng);
      const bbox = hasCoords ? buildRiskBbox(destination.lat, destination.lng) : null;

      return {
        queryKey: queryKeys.nearbyEvents({
          bbox,
          days: riskWindowDays,
          status: "open",
          limit: 18,
          scope: "saved",
          countryCode: destination.countryCode,
          place: destination.place,
        }),
        queryFn: () =>
          getNearbyEvents({
            bbox,
            days: riskWindowDays,
            status: "open",
            limit: 18,
          }),
        enabled: Boolean(bbox),
        staleTime: 1000 * 60 * 30,
      };
    }),
  });

  const cards = useMemo(() => {
    if (!countriesQuery.data) {
      return [];
    }

    return savedDestinations
      .map((destination, index) => {
        const country = countriesQuery.data.find(
          (item) => item.cca2.toLowerCase() === destination.countryCode,
        );
        const journey = journeys.find((item) => item.id === destination.journeyId);

        return buildSavedCard(
          {
            ...destination,
            journeyName: journey?.name || "Unassigned",
          },
          country,
          weatherQueries[index]?.data,
        );
      })
      .sort((left, right) => {
        if ((left.pinned ?? false) !== (right.pinned ?? false)) {
          return left.pinned ? -1 : 1;
        }

        return (
          new Date(right.savedAt || 0).getTime() -
          new Date(left.savedAt || 0).getTime()
        );
      });
  }, [countriesQuery.data, journeys, savedDestinations, weatherQueries]);

  const recentCards = useMemo(
    () => buildRecentCards(recentDestinations, countriesQuery.data ?? []),
    [countriesQuery.data, recentDestinations],
  );

  const journeyMetrics = useMemo(
    () => buildJourneyMetrics(journeys, cards),
    [cards, journeys],
  );

  const filterOptions = useMemo(
    () => [
      { value: "all", label: "All saved destinations" },
      { value: "pinned", label: "Pinned only" },
      { value: "unassigned", label: "Unassigned only" },
      ...journeys.map((journey) => ({
        value: journey.id,
        label: journey.name,
      })),
    ],
    [journeys],
  );

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return cards.filter((destination) => {
      const matchesQuery =
        !normalizedQuery ||
        destination.place.toLowerCase().includes(normalizedQuery) ||
        destination.countryName.toLowerCase().includes(normalizedQuery) ||
        destination.region.toLowerCase().includes(normalizedQuery) ||
        (destination.tags ?? []).some((tag) =>
          tag.toLowerCase().includes(normalizedQuery),
        );

      if (!matchesQuery) {
        return false;
      }

      if (scope === "all") {
        return true;
      }

      if (scope === "pinned") {
        return Boolean(destination.pinned);
      }

      if (scope === "unassigned") {
        return !destination.journeyId;
      }

      return destination.journeyId === scope;
    });
  }, [cards, query, scope]);

  const pinnedCards = useMemo(
    () => cards.filter((destination) => destination.pinned),
    [cards],
  );

  const historicalPlanMap = useMemo(() => {
    const next = new Map();

    savedDestinations.forEach((destination, index) => {
      const data = historicalWeatherQueries[index]?.data;

      if (!data) {
        return;
      }

      next.set(
        `${destination.countryCode}:${destination.place}`,
        buildTravelWindowPlan(mapHistoricalSeasonalityProfile(data), savedPlannerPreferences.profileId),
      );
    });

    return next;
  }, [historicalWeatherQueries, savedDestinations, savedPlannerPreferences.profileId]);

  const riskSnapshotMap = useMemo(() => {
    const next = new Map();

    savedDestinations.forEach((destination, index) => {
      const data = riskQueries[index]?.data;

      if (!data) {
        return;
      }

      next.set(
        `${destination.countryCode}:${destination.place}`,
        buildRiskSnapshot(mapRiskEvents(data), {
          days: riskWindowDays,
          scopeLabel: `${destination.place} vicinity`,
        }),
      );
    });

    return next;
  }, [riskQueries, riskWindowDays, savedDestinations]);

  const planningEntries = useMemo(
    () =>
      buildSavedPlanningEntries({
        destinations: filteredCards,
        travelWindowPlans: filteredCards.map(
          (destination) =>
            historicalPlanMap.get(`${destination.countryCode}:${destination.place}`) ??
            null,
        ),
        riskSnapshotMap,
        mode: savedPlannerPreferences.mode,
        selectedMonth: savedPlannerPreferences.selectedMonth,
        windowSize: savedPlannerPreferences.windowSize,
      }),
    [
      filteredCards,
      historicalPlanMap,
      riskSnapshotMap,
      savedPlannerPreferences.mode,
      savedPlannerPreferences.selectedMonth,
      savedPlannerPreferences.windowSize,
    ],
  );

  const planningSummary = useMemo(
    () => buildSavedPlanningSummary(planningEntries),
    [planningEntries],
  );

  const planningChartData = useMemo(
    () => buildSavedPlanningChartData(planningEntries),
    [planningEntries],
  );

  const activeJourney = useMemo(
    () => journeys.find((journey) => journey.id === scope) ?? null,
    [journeys, scope],
  );

  const workspaceLoading =
    countriesQuery.isLoading ||
    (savedDestinations.length > 0 &&
      !cards.length &&
      weatherQueries.some((queryItem) => queryItem.isLoading));
  const planningLoading =
    historicalWeatherQueries.some((queryItem) => queryItem.isLoading) &&
    savedDestinations.length > 0;
  const planningError =
    historicalWeatherQueries.find((queryItem) => queryItem.isError)?.error || null;
  const riskLoading = riskQueries.some((queryItem) => queryItem.isLoading);
  const riskError =
    riskQueries.find((queryItem) => queryItem.isError)?.error || null;

  function updatePlannerPreference(key, value) {
    setSavedPlannerPreferences({ [key]: value });
  }

  function handleSaveJourneyPlan(journeyId) {
    saveJourneyPlanningPreferences(journeyId, savedPlannerPreferences);
  }

  function handleLoadJourneyPlan(journeyId) {
    const journey = journeys.find((item) => item.id === journeyId);

    if (!journey?.planningPreferences) {
      return;
    }

    setSavedPlannerPreferences(journey.planningPreferences);
  }

  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Saved"
          title="A travel workspace that remembers what matters."
          description="This phase evolves the saved route into a locally persisted planning desk with pins, journey collections, recent history, editable notes, and reusable tags."
        />

        {!savedDestinations.length ? (
          <div className="mt-10">
            <EmptyState
              title="Nothing saved yet."
              description="Save destinations from cards or detail pages to create your personal travel intelligence board."
              action="Open explorer"
              onAction={() => navigate("/explore")}
            />
          </div>
        ) : workspaceLoading ? (
          <div className="mt-10 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Skeleton className="h-[30rem]" />
              <Skeleton className="h-[30rem]" />
            </div>
          </div>
        ) : countriesQuery.isError ? (
          <div className="mt-10">
            <ErrorState description={countriesQuery.error.message} />
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            <SavedOverview
              savedCount={cards.length}
              pinnedCount={pinnedCards.length}
              journeyCount={journeys.length}
              recentCount={recentCards.length}
            />

            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <JourneyBoard
                journeys={journeyMetrics}
                unassignedCount={cards.filter((item) => !item.journeyId).length}
                onCreateJourney={createJourney}
                onDeleteJourney={deleteJourney}
                activeJourneyId={activeJourney?.id}
                onSaveJourneyPlanningPreferences={handleSaveJourneyPlan}
                onLoadJourneyPlanningPreferences={handleLoadJourneyPlan}
              />
              <RecentDestinationsPanel
                recentDestinations={recentCards}
                onRemoveRecent={removeRecentDestination}
                onClearRecent={clearRecentDestinations}
              />
            </div>

            <ShellCard>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <SectionHeading
                  eyebrow="Workspace"
                  title="Filter, annotate, and organize the shortlist"
                  description="Everything here persists locally through Zustand, so the desk keeps your notes, journey assignments, and pin priorities between sessions."
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:w-[440px]">
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search saved places, regions, or tags"
                    aria-label="Search saved destinations"
                  />
                  <SelectField
                    value={scope}
                    onChange={(event) => setScope(event.target.value)}
                    aria-label="Filter saved destinations by scope"
                    options={filterOptions}
                  />
                </div>
              </div>
            </ShellCard>

            <SavedPlanningDesk
              entries={planningEntries}
              summary={planningSummary}
              chartData={planningChartData}
              profileId={savedPlannerPreferences.profileId}
              onProfileChange={(value) => updatePlannerPreference("profileId", value)}
              mode={savedPlannerPreferences.mode}
              onModeChange={(value) => updatePlannerPreference("mode", value)}
              selectedMonth={savedPlannerPreferences.selectedMonth}
              onSelectedMonthChange={(value) =>
                updatePlannerPreference("selectedMonth", value)
              }
              windowSize={savedPlannerPreferences.windowSize}
              onWindowSizeChange={(value) => updatePlannerPreference("windowSize", value)}
              activeJourney={activeJourney}
              onSaveJourneyProfile={() => handleSaveJourneyPlan(activeJourney.id)}
              onLoadJourneyProfile={() => handleLoadJourneyPlan(activeJourney.id)}
              isLoading={planningLoading}
              isError={Boolean(planningError)}
              errorMessage={planningError?.message}
              isRiskLoading={riskLoading}
              isRiskError={Boolean(riskError)}
              riskErrorMessage={riskError?.message}
            />

            {filteredCards.length ? (
              <div className="grid gap-6">
                {filteredCards.map((destination) => (
                  <SavedWorkspaceCard
                    key={destination.id}
                    destination={destination}
                    journeys={journeys}
                  />
                ))}
              </div>
            ) : (
              <ShellCard>
                <p className="text-sm leading-7 text-slate-400">
                  No saved destinations match the current search and scope filters. Try a
                  broader query or switch back to all saved destinations.
                </p>
                <div className="mt-5">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setScope("all");
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              </ShellCard>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
