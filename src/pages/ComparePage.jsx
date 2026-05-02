import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CompareForecastChart } from "../components/charts/CompareForecastChart";
import { CompareRadarChart } from "../components/charts/CompareRadarChart";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ShellCard } from "../components/ui/ShellCard";
import { Skeleton } from "../components/ui/Skeleton";
import { CompareClusterMap } from "../features/compare/components/CompareClusterMap";
import { CompareDestinationGrid } from "../features/compare/components/CompareDestinationGrid";
import { CompareMatrix } from "../features/compare/components/CompareMatrix";
import { CompareOverview } from "../features/compare/components/CompareOverview";
import { CompareRecommendationPanel } from "../features/compare/components/CompareRecommendationPanel";
import { CompareSeasonalityBoard } from "../features/compare/components/CompareSeasonalityBoard";
import { CompareSeasonalityInsights } from "../features/compare/components/CompareSeasonalityInsights";
import { CompareRiskBoard } from "../features/risk/components/CompareRiskBoard";
import {
  buildCompareDestination,
  buildCompareForecastData,
  buildCompareOverview,
  buildCompareRadarData,
  buildCompareRecommendations,
  buildCompareSeasonalityChartData,
  buildCompareSeasonalityEntries,
  buildCompareSeasonalityRecommendations,
} from "../features/compare/compare.utils";
import { buildRiskBbox, buildRiskSnapshot } from "../lib/risk";
import { buildTravelWindowPlan } from "../lib/scoring/travelWindowScore";
import { TRAVEL_PROFILE_OPTIONS } from "../lib/scoring/travelProfileScore";
import { buildSeasonalityDateRange } from "../lib/seasonality";
import { getAllCountries } from "../services/api/countries.api";
import { getNearbyEvents } from "../services/api/eonet.api";
import {
  getAirQuality,
  getForecast,
  getHistoricalDailyWeather,
} from "../services/api/openMeteo.api";
import { mapRiskEvents } from "../services/mappers/risk.mapper";
import { mapHistoricalSeasonalityProfile } from "../services/mappers/seasonality.mapper";
import { queryKeys } from "../services/query/queryKeys";
import { useAppStore } from "../store/useAppStore";

export function ComparePage() {
  const navigate = useNavigate();
  const [selectedTravelProfile, setSelectedTravelProfile] = useState(
    TRAVEL_PROFILE_OPTIONS[0].value,
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1,
  );
  const compareDestinations = useAppStore((state) => state.compareDestinations);
  const clearCompareDestinations = useAppStore(
    (state) => state.clearCompareDestinations,
  );
  const historicalRange = useMemo(() => buildSeasonalityDateRange(), []);
  const riskWindowDays = 21;

  const countriesQuery = useQuery({
    queryKey: queryKeys.countries,
    queryFn: getAllCountries,
  });

  const weatherQueries = useQueries({
    queries: compareDestinations.map((destination) => ({
      queryKey: queryKeys.forecast(destination.lat, destination.lng),
      queryFn: () => getForecast(destination.lat, destination.lng),
      enabled: Number.isFinite(destination.lat) && Number.isFinite(destination.lng),
    })),
  });

  const airQualityQueries = useQueries({
    queries: compareDestinations.map((destination) => ({
      queryKey: queryKeys.airQuality(destination.lat, destination.lng),
      queryFn: () => getAirQuality(destination.lat, destination.lng),
      enabled: Number.isFinite(destination.lat) && Number.isFinite(destination.lng),
    })),
  });

  const historicalWeatherQueries = useQueries({
    queries: compareDestinations.map((destination) => ({
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
    queries: compareDestinations.map((destination) => {
      const hasCoords =
        Number.isFinite(destination.lat) && Number.isFinite(destination.lng);
      const bbox = hasCoords ? buildRiskBbox(destination.lat, destination.lng) : null;

      return {
        queryKey: queryKeys.nearbyEvents({
          bbox,
          days: riskWindowDays,
          status: "open",
          limit: 18,
          scope: "compare",
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

  const compared = useMemo(() => {
    if (!countriesQuery.data) {
      return [];
    }

    return compareDestinations.map((destination, index) => {
      const country = countriesQuery.data.find(
        (item) => item.cca2.toLowerCase() === destination.countryCode,
      );

      return buildCompareDestination({
        destination,
        country,
        forecast: weatherQueries[index]?.data,
        airQuality: airQualityQueries[index]?.data,
        index,
      });
    });
  }, [airQualityQueries, compareDestinations, countriesQuery.data, weatherQueries]);

  const overview = useMemo(() => buildCompareOverview(compared), [compared]);
  const forecastData = useMemo(
    () => buildCompareForecastData(compared),
    [compared],
  );
  const radarData = useMemo(() => buildCompareRadarData(compared), [compared]);
  const recommendations = useMemo(
    () => buildCompareRecommendations(compared),
    [compared],
  );

  const historicalSeasonalityProfiles = useMemo(
    () =>
      historicalWeatherQueries.map((query) =>
        query.data ? mapHistoricalSeasonalityProfile(query.data) : null,
      ),
    [historicalWeatherQueries],
  );

  const travelWindowPlans = useMemo(
    () =>
      historicalSeasonalityProfiles.map((profile) =>
        profile ? buildTravelWindowPlan(profile, selectedTravelProfile) : null,
      ),
    [historicalSeasonalityProfiles, selectedTravelProfile],
  );

  const seasonalityEntries = useMemo(
    () =>
      buildCompareSeasonalityEntries(
        compared,
        travelWindowPlans,
        selectedMonth,
      ),
    [compared, selectedMonth, travelWindowPlans],
  );

  const seasonalityChartData = useMemo(
    () => buildCompareSeasonalityChartData(seasonalityEntries),
    [seasonalityEntries],
  );

  const seasonalityRecommendations = useMemo(
    () => buildCompareSeasonalityRecommendations(seasonalityEntries),
    [seasonalityEntries],
  );

  const riskSnapshotMap = useMemo(() => {
    const next = new Map();

    compareDestinations.forEach((destination, index) => {
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
  }, [compareDestinations, riskQueries, riskWindowDays]);

  const riskEntries = useMemo(() => {
    const baseEntries = seasonalityEntries.length ? seasonalityEntries : compared;

    return baseEntries.map((entry) => ({
      ...entry,
      riskSnapshot:
        riskSnapshotMap.get(`${entry.countryCode}:${entry.place}`) ?? null,
    }));
  }, [compared, riskSnapshotMap, seasonalityEntries]);

  const isCompareLoading =
    countriesQuery.isLoading ||
    weatherQueries.some((query) => query.isLoading) ||
    airQualityQueries.some((query) => query.isLoading);

  const compareError =
    countriesQuery.error ||
    weatherQueries.find((query) => query.isError)?.error ||
    airQualityQueries.find((query) => query.isError)?.error;

  const isSeasonalityLoading = historicalWeatherQueries.some(
    (query) => query.isLoading,
  );
  const seasonalityError =
    historicalWeatherQueries.find((query) => query.isError)?.error ?? null;
  const isRiskLoading = riskQueries.some((query) => query.isLoading);
  const riskError = riskQueries.find((query) => query.isError)?.error ?? null;

  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Compare"
            title="Read destinations as a live intelligence board."
            description="This phase turns the compare route into a real decision surface with travel scoring, AQI reads, forecast trend lines, and direct side-by-side reasoning."
          />
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate("/explore")}>
              Explore destinations
            </Button>
            {compareDestinations.length ? (
              <Button onClick={clearCompareDestinations}>Clear board</Button>
            ) : null}
          </div>
        </div>

        {!compareDestinations.length ? (
          <div className="mt-10">
            <EmptyState
              title="No destinations in compare mode."
              description="Add up to three destinations from the explore or destination pages to start building a richer compare workflow."
              action="Open explorer"
              onAction={() => navigate("/explore")}
            />
          </div>
        ) : isCompareLoading && !compared.length ? (
          <div className="mt-10 space-y-6">
            <div className="grid gap-6 xl:grid-cols-4">
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Skeleton className="h-[30rem]" />
              <Skeleton className="h-[30rem]" />
            </div>
          </div>
        ) : compareError ? (
          <div className="mt-10">
            <ErrorState description={compareError.message} />
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            <CompareOverview overview={overview} />

            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <CompareSeasonalityBoard
                entries={seasonalityEntries}
                chartData={seasonalityChartData}
                selectedProfileId={selectedTravelProfile}
                onProfileChange={setSelectedTravelProfile}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                historicalRange={historicalRange}
                isLoading={isSeasonalityLoading}
                isError={Boolean(seasonalityError)}
                errorMessage={seasonalityError?.message}
              />
              <CompareSeasonalityInsights
                entries={seasonalityEntries}
                recommendations={seasonalityRecommendations}
                isLoading={isSeasonalityLoading}
                isError={Boolean(seasonalityError)}
                errorMessage={seasonalityError?.message}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <CompareClusterMap destinations={compared} />
              <CompareRiskBoard
                entries={riskEntries}
                isLoading={isRiskLoading}
                isError={Boolean(riskError)}
                errorMessage={riskError?.message}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <ShellCard>
                <SectionHeading
                  eyebrow="Trendline"
                  title="Seven-day thermal midpoint"
                  description="Each line is built from live Open-Meteo daily highs and lows so you can read the medium-range movement, not just a single current reading."
                />
                <div className="mt-8">
                  <CompareForecastChart
                    data={forecastData}
                    destinations={compared}
                  />
                </div>
              </ShellCard>

              <CompareRecommendationPanel recommendations={recommendations} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <ShellCard>
                <SectionHeading
                  eyebrow="Score map"
                  title="Shape of each destination"
                  description="Radar layers make it easy to spot whether a destination is winning on warmth, comfort, clean air, or lower weather friction."
                />
                <div className="mt-8">
                  <CompareRadarChart data={radarData} destinations={compared} />
                </div>
              </ShellCard>

              <CompareMatrix destinations={compared} />
            </div>

            <div>
              <SectionHeading
                eyebrow="Destinations"
                title="Board members"
                description="Each destination keeps its live operating read, country context, and direct actions close together so the compare page feels usable, not just visual."
              />
              <div className="mt-8">
                <CompareDestinationGrid destinations={compared} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
