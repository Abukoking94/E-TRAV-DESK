import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { SectionHeading } from "../components/ui/SectionHeading";
import { PlannerCandidateBoard } from "../features/planner/components/PlannerCandidateBoard";
import { PlannerControlPanel } from "../features/planner/components/PlannerControlPanel";
import { PlannerResultsBoard } from "../features/planner/components/PlannerResultsBoard";
import { TravelSignalMapPanel } from "../features/maps/components/TravelSignalMapPanel";
import {
  buildPlannerCandidatePool,
  buildPlannerChartData,
  buildPlannerEntries,
  buildPlannerSummary,
  filterPlannerCandidates,
} from "../features/planner/planner.utils";
import { buildRiskBbox, buildRiskSnapshot } from "../lib/risk";
import { TRAVEL_PROFILE_OPTIONS } from "../lib/scoring/travelProfileScore";
import { buildTravelWindowPlan } from "../lib/scoring/travelWindowScore";
import { buildSeasonalityDateRange } from "../lib/seasonality";
import { getAllCountries } from "../services/api/countries.api";
import { getNearbyEvents } from "../services/api/eonet.api";
import { getHistoricalDailyWeather } from "../services/api/openMeteo.api";
import { mapRiskEvents } from "../services/mappers/risk.mapper";
import { mapHistoricalSeasonalityProfile } from "../services/mappers/seasonality.mapper";
import { queryKeys } from "../services/query/queryKeys";
import { useAppStore } from "../store/useAppStore";

function normalizePlannerProfile(value) {
  return TRAVEL_PROFILE_OPTIONS.some((option) => option.value === value)
    ? value
    : "warm-dry";
}

function normalizePlannerMode(value) {
  return value === "best-window" ? "best-window" : "exact-month";
}

function normalizePlannerMonth(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 12
    ? numeric
    : new Date().getMonth() + 1;
}

function normalizePlannerWindow(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 3 ? numeric : 2;
}

export function PlannerPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const compareDestinations = useAppStore((state) => state.compareDestinations);
  const savedDestinations = useAppStore((state) => state.savedDestinations);
  const historicalRange = useMemo(() => buildSeasonalityDateRange(), []);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [profileId, setProfileId] = useState(() =>
    normalizePlannerProfile(searchParams.get("profile")),
  );
  const [mode, setMode] = useState(() =>
    normalizePlannerMode(searchParams.get("mode")),
  );
  const [selectedMonth, setSelectedMonth] = useState(() =>
    normalizePlannerMonth(searchParams.get("month")),
  );
  const [windowSize, setWindowSize] = useState(() =>
    normalizePlannerWindow(searchParams.get("window")),
  );
  const riskWindowDays = 21;

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (query.trim()) {
      nextParams.set("q", query.trim());
    }

    nextParams.set("profile", profileId);
    nextParams.set("mode", mode);
    nextParams.set("month", String(selectedMonth));
    nextParams.set("window", String(windowSize));

    setSearchParams(nextParams, { replace: true });
  }, [mode, profileId, query, selectedMonth, setSearchParams, windowSize]);

  const countriesQuery = useQuery({
    queryKey: queryKeys.countries,
    queryFn: getAllCountries,
  });

  const candidatePool = useMemo(
    () =>
      buildPlannerCandidatePool({
        savedDestinations,
        compareDestinations,
        countries: countriesQuery.data ?? [],
      }),
    [compareDestinations, countriesQuery.data, savedDestinations],
  );

  const [selectedDestinations, setSelectedDestinations] = useState([]);

  const seededSelection = useMemo(
    () => candidatePool.slice(0, Math.min(candidatePool.length, 3)),
    [candidatePool],
  );

  const activeSelection = selectedDestinations.length
    ? selectedDestinations
    : seededSelection;

  const visibleCandidates = useMemo(
    () => filterPlannerCandidates(candidatePool, query),
    [candidatePool, query],
  );

  const historicalWeatherQueries = useQueries({
    queries: activeSelection.map((destination) => ({
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
    queries: activeSelection.map((destination) => {
      const hasCoords =
        Number.isFinite(destination.lat) && Number.isFinite(destination.lng);
      const bbox = hasCoords ? buildRiskBbox(destination.lat, destination.lng) : null;

      return {
        queryKey: queryKeys.nearbyEvents({
          bbox,
          days: riskWindowDays,
          status: "open",
          limit: 18,
          scope: "planner",
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

  const travelWindowPlans = useMemo(
    () =>
      historicalWeatherQueries.map((queryItem) =>
        queryItem.data
          ? buildTravelWindowPlan(
              mapHistoricalSeasonalityProfile(queryItem.data),
              profileId,
            )
          : null,
      ),
    [historicalWeatherQueries, profileId],
  );

  const plannerEntries = useMemo(
    () =>
      buildPlannerEntries({
        selectedDestinations: activeSelection,
        travelWindowPlans,
        mode,
        selectedMonth,
        windowSize,
      }),
    [activeSelection, mode, selectedMonth, travelWindowPlans, windowSize],
  );

  const plannerSummary = useMemo(
    () => buildPlannerSummary(plannerEntries, mode),
    [mode, plannerEntries],
  );

  const plannerChartData = useMemo(
    () => buildPlannerChartData(plannerEntries),
    [plannerEntries],
  );

  const plannerRiskSnapshotMap = useMemo(() => {
    const next = new Map();

    activeSelection.forEach((destination, index) => {
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
  }, [activeSelection, riskQueries, riskWindowDays]);

  const plannerEntriesWithRisk = useMemo(
    () =>
      plannerEntries.map((entry) => ({
        ...entry,
        riskSnapshot:
          plannerRiskSnapshotMap.get(`${entry.countryCode}:${entry.place}`) ?? null,
      })),
    [plannerEntries, plannerRiskSnapshotMap],
  );

  const plannerLoading =
    countriesQuery.isLoading ||
    historicalWeatherQueries.some((queryItem) => queryItem.isLoading);
  const plannerError =
    countriesQuery.error ||
    historicalWeatherQueries.find((queryItem) => queryItem.isError)?.error ||
    null;
  const plannerRiskLoading = riskQueries.some((queryItem) => queryItem.isLoading);
  const plannerRiskError =
    riskQueries.find((queryItem) => queryItem.isError)?.error || null;
  const activeProfileLabel =
    TRAVEL_PROFILE_OPTIONS.find((option) => option.value === profileId)?.label ||
    "Travel profile";

  function toggleDestination(destination) {
    setSelectedDestinations((current) => {
      const baseSelection = current.length ? current : seededSelection;
      const exists = baseSelection.some(
        (item) =>
          item.countryCode === destination.countryCode && item.place === destination.place,
      );

      if (exists) {
        return baseSelection.filter(
          (item) =>
            !(
              item.countryCode === destination.countryCode &&
              item.place === destination.place
            ),
        );
      }

      return [...baseSelection, destination].slice(0, 5);
    });
  }

  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Planner"
            title="Rank where and when to go next."
            description="This route turns the seasonality engine into a planning workflow with destination selection, travel-style ranking, and window-led recommendations."
          />
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate("/compare")}>
              Open compare board
            </Button>
            <Button variant="secondary" onClick={() => navigate("/saved")}>
              Open saved desk
            </Button>
          </div>
        </div>

        {countriesQuery.isError ? (
          <div className="mt-10">
            <ErrorState description={countriesQuery.error.message} />
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            <PlannerControlPanel
              query={query}
              onQueryChange={setQuery}
              profileId={profileId}
              onProfileChange={setProfileId}
              mode={mode}
              onModeChange={setMode}
              selectedMonth={selectedMonth}
              onSelectedMonthChange={setSelectedMonth}
              windowSize={windowSize}
              onWindowSizeChange={setWindowSize}
              selectedCount={activeSelection.length}
            />

            <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
              <PlannerCandidateBoard
                candidates={visibleCandidates}
                selectedDestinations={activeSelection}
                onToggleDestination={toggleDestination}
              />
              <PlannerResultsBoard
                entries={plannerEntriesWithRisk}
                summary={plannerSummary}
                chartData={plannerChartData}
                mode={mode}
                selectedMonth={selectedMonth}
                windowSize={windowSize}
                isLoading={plannerLoading}
                isError={Boolean(plannerError)}
                errorMessage={plannerError?.message}
                isRiskLoading={plannerRiskLoading}
                isRiskError={Boolean(plannerRiskError)}
                riskErrorMessage={plannerRiskError?.message}
              />
            </div>

            <TravelSignalMapPanel
              title="Spatial planning field"
              description="This atlas layer projects the active planner shortlist into one geospatial field so selected-month strength, best-window quality, and live risk can be read spatially."
              entries={plannerEntriesWithRisk}
              selectedMonth={selectedMonth}
              scopeLabel="planner shortlist"
              supportingLabel={`${activeProfileLabel} / ${
                mode === "best-window"
                  ? `${windowSize}-month ranking window`
                  : `Month ${selectedMonth} focus`
              } / ${plannerEntriesWithRisk.length} active destinations`}
            />
          </div>
        )}
      </div>
    </section>
  );
}
