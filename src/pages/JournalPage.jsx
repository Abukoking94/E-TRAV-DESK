import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { ShellCard } from "../components/ui/ShellCard";
import { Skeleton } from "../components/ui/Skeleton";
import { JournalHero } from "../features/journal/components/JournalHero";
import { JournalOverviewRow } from "../features/journal/components/JournalOverviewRow";
import { JournalRegionNarratives } from "../features/journal/components/JournalRegionNarratives";
import { JournalStoryGrid } from "../features/journal/components/JournalStoryGrid";
import { JournalThemeCollections } from "../features/journal/components/JournalThemeCollections";
import {
  buildJournalClimateSignals,
  buildJournalOverview,
  buildJournalRegionNarratives,
  buildJournalSpotlight,
  buildJournalStories,
  buildJournalThemes,
} from "../features/journal/journal.utils";
import { getAllCountries } from "../services/api/countries.api";
import { getForecast } from "../services/api/openMeteo.api";
import { getDestinationSummary } from "../services/api/wikipedia.api";
import { queryKeys } from "../services/query/queryKeys";

export function JournalPage() {
  const countriesQuery = useQuery({
    queryKey: queryKeys.countries,
    queryFn: getAllCountries,
  });

  const storyCountries = useMemo(
    () =>
      [...(countriesQuery.data ?? [])]
        .filter((country) => Array.isArray(country.latlng) && country.latlng.length >= 2)
        .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
        .slice(0, 8),
    [countriesQuery.data],
  );

  const summaryQueries = useQueries({
    queries: storyCountries.map((country) => ({
      queryKey: queryKeys.summary(country.name.common),
      queryFn: () => getDestinationSummary(country.name.common),
      enabled: Boolean(country.name.common),
    })),
  });

  const forecastQueries = useQueries({
    queries: storyCountries.map((country) => ({
      queryKey: queryKeys.forecast(country.latlng?.[0], country.latlng?.[1]),
      queryFn: () => getForecast(country.latlng[0], country.latlng[1]),
      enabled: Boolean(country.latlng?.length >= 2),
    })),
  });

  const dominantRegions = useMemo(() => {
    const regionMap = (countriesQuery.data ?? []).reduce((accumulator, country) => {
      if (!country.region) {
        return accumulator;
      }

      accumulator[country.region] = (accumulator[country.region] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(regionMap)
      .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)
      .slice(0, 4)
      .map(([region]) => region);
  }, [countriesQuery.data]);

  const regionSummaryQueries = useQueries({
    queries: dominantRegions.map((region) => ({
      queryKey: queryKeys.summary(region),
      queryFn: () => getDestinationSummary(region),
      enabled: Boolean(region),
    })),
  });

  const climateSignals = useMemo(
    () =>
      buildJournalClimateSignals(
        storyCountries,
        forecastQueries.map((query) => query.data),
      ),
    [forecastQueries, storyCountries],
  );

  const overview = useMemo(
    () => buildJournalOverview(countriesQuery.data ?? [], climateSignals),
    [climateSignals, countriesQuery.data],
  );

  const spotlight = useMemo(
    () =>
      buildJournalSpotlight(
        storyCountries,
        summaryQueries.map((query) => query.data),
        climateSignals,
      ),
    [climateSignals, storyCountries, summaryQueries],
  );

  const themes = useMemo(
    () => buildJournalThemes(countriesQuery.data ?? [], climateSignals),
    [climateSignals, countriesQuery.data],
  );

  const regionNarratives = useMemo(() => {
    const regionSummaryMap = dominantRegions.reduce((accumulator, region, index) => {
      accumulator[region] = regionSummaryQueries[index]?.data;
      return accumulator;
    }, {});

    return buildJournalRegionNarratives(
      countriesQuery.data ?? [],
      regionSummaryMap,
    );
  }, [countriesQuery.data, dominantRegions, regionSummaryQueries]);

  const stories = useMemo(
    () =>
      buildJournalStories(
        storyCountries,
        summaryQueries.map((query) => query.data),
        climateSignals,
      ).slice(0, 6),
    [climateSignals, storyCountries, summaryQueries],
  );

  return (
    <section className="section-space">
      <div className="page-shell">
        {countriesQuery.isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-80" />
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
              <Skeleton className="h-52" />
            </div>
          </div>
        ) : null}

        {countriesQuery.isError ? (
          <div className="mt-10">
            <ErrorState description={countriesQuery.error.message} />
          </div>
        ) : null}

        {!countriesQuery.isLoading && !countriesQuery.isError ? (
          <div className="space-y-6">
            <JournalHero spotlight={spotlight} />
            <JournalOverviewRow overview={overview} />

            {themes.length ? <JournalThemeCollections themes={themes} /> : null}

            {regionNarratives.length ? (
              <JournalRegionNarratives items={regionNarratives} />
            ) : null}

            {stories.length ? (
              <JournalStoryGrid stories={stories} />
            ) : (
              <ShellCard>
                <EmptyState
                  title="No editorial stories available yet."
                  description="The live country sample loaded, but the journal does not yet have enough public summary data to compose story cards."
                />
              </ShellCard>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
