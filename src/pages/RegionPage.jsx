import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { DestinationCard } from "../components/cards/DestinationCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ShellCard } from "../components/ui/ShellCard";
import { Skeleton } from "../components/ui/Skeleton";
import { RegionClimateBoard } from "../features/regions/components/RegionClimateBoard";
import { RegionCollections } from "../features/regions/components/RegionCollections";
import { RegionHero } from "../features/regions/components/RegionHero";
import { RegionOverviewRow } from "../features/regions/components/RegionOverviewRow";
import { RegionRiskWatch } from "../features/risk/components/RegionRiskWatch";
import { RegionSignalMap } from "../features/regions/components/RegionSignalMap";
import { RegionSpotlights } from "../features/regions/components/RegionSpotlights";
import { getRegionProfile } from "../features/regions/region.config";
import {
  buildRegionClimateChartData,
  buildRegionClimateDestinations,
  buildRegionCollections,
  buildRegionDestinationCards,
  buildRegionOverview,
  buildRegionSpotlights,
} from "../features/regions/region.utils";
import { toTitle } from "../lib/formatters";
import { buildRiskBbox, buildRiskBboxFromPoints, buildRiskSnapshot } from "../lib/risk";
import { buildSeasonalityDateRange } from "../lib/seasonality";
import { getCountriesByRegion } from "../services/api/countries.api";
import { getNearbyEvents } from "../services/api/eonet.api";
import { getForecast, getHistoricalDailyWeather } from "../services/api/openMeteo.api";
import { getDestinationSummary } from "../services/api/wikipedia.api";
import { mapRiskEvents } from "../services/mappers/risk.mapper";
import { mapHistoricalSeasonalityProfile } from "../services/mappers/seasonality.mapper";
import { queryKeys } from "../services/query/queryKeys";

export function RegionPage() {
  const { region } = useParams();
  const regionKey = region.toLowerCase();
  const profile = getRegionProfile(regionKey);
  const historicalRange = useMemo(() => buildSeasonalityDateRange(), []);

  const regionQuery = useQuery({
    queryKey: queryKeys.region(regionKey),
    queryFn: () => getCountriesByRegion(regionKey),
  });

  const regionSummaryQuery = useQuery({
    queryKey: queryKeys.summary(profile.title),
    queryFn: () => getDestinationSummary(profile.title),
    enabled: Boolean(profile.title),
  });

  const spotlightCountries = useMemo(
    () =>
      [...(regionQuery.data ?? [])]
        .sort((left, right) => (right.population ?? 0) - (left.population ?? 0))
        .slice(0, 3),
    [regionQuery.data],
  );

  const climateCountries = useMemo(
    () =>
      [...(regionQuery.data ?? [])]
        .filter((country) => Array.isArray(country.latlng) && country.latlng.length >= 2)
        .sort((left, right) => (right.population ?? 0) - (left.population ?? 0))
        .slice(0, 6),
    [regionQuery.data],
  );

  const climateQueries = useQueries({
    queries: climateCountries.map((country) => ({
      queryKey: queryKeys.forecast(country.latlng?.[0], country.latlng?.[1]),
      queryFn: () => getForecast(country.latlng[0], country.latlng[1]),
      enabled: Boolean(country.latlng?.length >= 2),
    })),
  });

  const climateHistoricalQueries = useQueries({
    queries: climateCountries.map((country) => ({
      queryKey: queryKeys.historicalWeather(
        country.latlng?.[0],
        country.latlng?.[1],
        historicalRange.startDate,
        historicalRange.endDate,
        "auto",
      ),
      queryFn: () =>
        getHistoricalDailyWeather(country.latlng[0], country.latlng[1], {
          startDate: historicalRange.startDate,
          endDate: historicalRange.endDate,
          timezone: "auto",
        }),
      enabled: Boolean(country.latlng?.length >= 2),
      staleTime: 1000 * 60 * 60 * 24,
    })),
  });

  const climateRiskQueries = useQueries({
    queries: climateCountries.map((country) => ({
      queryKey: queryKeys.nearbyEvents({
        bbox:
          Array.isArray(country.latlng) && country.latlng.length >= 2
            ? buildRiskBbox(country.latlng[0], country.latlng[1])
            : null,
        days: 21,
        status: "open",
        limit: 18,
        scope: "region-sampled",
        countryCode: country.cca2.toLowerCase(),
      }),
      queryFn: () =>
        getNearbyEvents({
          bbox: buildRiskBbox(country.latlng[0], country.latlng[1]),
          days: 21,
          status: "open",
          limit: 18,
        }),
      enabled: Boolean(country.latlng?.length >= 2),
      staleTime: 1000 * 60 * 30,
    })),
  });

  const spotlightSummaryQueries = useQueries({
    queries: spotlightCountries.map((country) => ({
      queryKey: queryKeys.summary(country.name.common),
      queryFn: () => getDestinationSummary(country.name.common),
      enabled: Boolean(country.name.common),
    })),
  });

  const climateDestinations = useMemo(
    () =>
      buildRegionClimateDestinations(
        climateCountries,
        climateQueries.map((query) => query.data),
      ),
    [climateCountries, climateQueries],
  );

  const overview = useMemo(
    () => buildRegionOverview(regionQuery.data ?? [], climateDestinations),
    [climateDestinations, regionQuery.data],
  );

  const collections = useMemo(
    () => buildRegionCollections(regionQuery.data ?? [], climateDestinations),
    [climateDestinations, regionQuery.data],
  );

  const destinations = useMemo(
    () => buildRegionDestinationCards(regionQuery.data ?? [], climateDestinations),
    [climateDestinations, regionQuery.data],
  );

  const spotlights = useMemo(
    () =>
      buildRegionSpotlights(
        regionQuery.data ?? [],
        spotlightSummaryQueries.map((query) => query.data),
      ),
    [regionQuery.data, spotlightSummaryQueries],
  );

  const climateChartData = useMemo(
    () => buildRegionClimateChartData(climateDestinations),
    [climateDestinations],
  );

  const climateSeasonalityProfiles = useMemo(
    () =>
      climateHistoricalQueries.map((query) =>
        query.data ? mapHistoricalSeasonalityProfile(query.data) : null,
      ),
    [climateHistoricalQueries],
  );

  const riskPoints = useMemo(
    () =>
      [...(regionQuery.data ?? [])]
        .filter((country) => Array.isArray(country.latlng) && country.latlng.length >= 2)
        .sort((left, right) => (right.population ?? 0) - (left.population ?? 0))
        .slice(0, 18)
        .map((country) => ({
          lat: country.latlng[0],
          lng: country.latlng[1],
        })),
    [regionQuery.data],
  );

  const regionRiskBbox = useMemo(
    () => (riskPoints.length ? buildRiskBboxFromPoints(riskPoints) : null),
    [riskPoints],
  );

  const regionRiskQuery = useQuery({
    queryKey: queryKeys.nearbyEvents({
      bbox: regionRiskBbox,
      days: 30,
      status: "open",
      limit: 24,
      scope: "region",
      region: regionKey,
    }),
    queryFn: () =>
      getNearbyEvents({
        bbox: regionRiskBbox,
        days: 30,
        status: "open",
        limit: 24,
      }),
    enabled: Boolean(regionRiskBbox),
    staleTime: 1000 * 60 * 30,
  });

  const regionRiskSnapshot = useMemo(
    () =>
      regionRiskQuery.data
        ? buildRiskSnapshot(mapRiskEvents(regionRiskQuery.data), {
            days: 30,
            scopeLabel: `${toTitle(regionKey)} regional field`,
          })
        : null,
    [regionKey, regionRiskQuery.data],
  );

  const sampledRiskSnapshotMap = useMemo(() => {
    const next = new Map();

    climateCountries.forEach((country, index) => {
      const data = climateRiskQueries[index]?.data;

      if (!data) {
        return;
      }

      next.set(
        country.cca2.toLowerCase(),
        buildRiskSnapshot(mapRiskEvents(data), {
          days: 21,
          scopeLabel: `${country.name.common} vicinity`,
        }),
      );
    });

    return next;
  }, [climateCountries, climateRiskQueries]);

  return (
    <section className="section-space">
      <div className="page-shell">
        {regionQuery.isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-72" />
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
            </div>
          </div>
        ) : null}

        {regionQuery.isError ? (
          <div className="mt-10">
            <ErrorState description={regionQuery.error.message} />
          </div>
        ) : null}

        {!regionQuery.isLoading && !regionQuery.isError ? (
          <div className="space-y-6">
            <RegionHero
              profile={profile}
              regionTitle={toTitle(regionKey)}
              summary={regionSummaryQuery.data?.extract}
            />

            <RegionOverviewRow overview={overview} />

            {spotlights.length ? <RegionSpotlights items={spotlights} /> : null}

            <RegionSignalMap
              countries={regionQuery.data ?? []}
              climateDestinations={climateDestinations}
              seasonalityProfiles={climateSeasonalityProfiles}
              riskSnapshotMap={sampledRiskSnapshotMap}
              regionTitle={toTitle(regionKey)}
            />

            <RegionRiskWatch
              riskSnapshot={regionRiskSnapshot}
              isLoading={regionRiskQuery.isLoading}
              isError={regionRiskQuery.isError}
              errorMessage={regionRiskQuery.error?.message}
            />

            {climateDestinations.length ? (
              <RegionClimateBoard
                climateDestinations={climateDestinations}
                chartData={climateChartData}
              />
            ) : (
              <ShellCard>
                <p className="text-sm leading-7 text-slate-400">
                  Live regional climate sampling is unavailable for this region right now,
                  but the destination hub and country context are still active.
                </p>
              </ShellCard>
            )}

            <RegionCollections collections={collections} />

            <div>
              <SectionHeading
                eyebrow="Destinations"
                title={`${toTitle(regionKey)} destination grid`}
                description="The regional route still resolves to concrete destination cards, but now it sits on top of live rankings and stronger framing."
              />
              {destinations.length ? (
                <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {destinations.map((destination) => (
                    <DestinationCard key={destination.id} destination={destination} />
                  ))}
                </div>
              ) : (
                <div className="mt-8">
                  <EmptyState
                    title="No destinations available for this region."
                    description="The region exists in routing, but the current country dataset did not return destination rows to display here."
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
