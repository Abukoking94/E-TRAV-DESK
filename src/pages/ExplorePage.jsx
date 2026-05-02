import { useEffect, useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Layers3, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DestinationCard } from "../components/cards/DestinationCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { MetricCard } from "../components/ui/MetricCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { SelectField } from "../components/ui/SelectField";
import { ShellCard } from "../components/ui/ShellCard";
import { Skeleton } from "../components/ui/Skeleton";
import { ExploreFilters } from "../features/explore/components/ExploreFilters";
import { useDebounce } from "../hooks/useDebounce";
import { formatNumber } from "../lib/formatters";
import { getAllCountries } from "../services/api/countries.api";
import { getForecast, searchDestinations } from "../services/api/openMeteo.api";
import { queryKeys } from "../services/query/queryKeys";
import { useAppStore } from "../store/useAppStore";

const MODE_OPTIONS = [
  { label: "All results", value: "all" },
  { label: "Countries", value: "countries" },
  { label: "Cities", value: "cities" },
];

const COUNTRY_SORT_OPTIONS = [
  { label: "Most populous", value: "population-desc" },
  { label: "Least populous", value: "population-asc" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
];

const CITY_SORT_OPTIONS = [
  { label: "Most relevant", value: "relevance" },
  { label: "Warmest now", value: "temperature-desc" },
  { label: "Coolest now", value: "temperature-asc" },
  { label: "Name A-Z", value: "name-asc" },
];

const ALL_SORT_OPTIONS = [{ label: "Best match", value: "relevance" }];

const POPULATION_OPTIONS = [
  { label: "All population bands", value: "all" },
  { label: "Under 10M", value: "under-10m" },
  { label: "10M to 50M", value: "10m-50m" },
  { label: "50M to 150M", value: "50m-150m" },
  { label: "Over 150M", value: "over-150m" },
];

function getSortOptions(mode) {
  if (mode === "countries") {
    return COUNTRY_SORT_OPTIONS;
  }

  if (mode === "cities") {
    return CITY_SORT_OPTIONS;
  }

  return ALL_SORT_OPTIONS;
}

function matchesPopulation(population, filter) {
  if (filter === "under-10m") {
    return population < 10_000_000;
  }

  if (filter === "10m-50m") {
    return population >= 10_000_000 && population < 50_000_000;
  }

  if (filter === "50m-150m") {
    return population >= 50_000_000 && population < 150_000_000;
  }

  if (filter === "over-150m") {
    return population >= 150_000_000;
  }

  return true;
}

function sortCountries(countries, sort) {
  const items = [...countries];

  if (sort === "population-asc") {
    return items.sort((left, right) => (left.population ?? 0) - (right.population ?? 0));
  }

  if (sort === "name-asc") {
    return items.sort((left, right) =>
      left.countryName.localeCompare(right.countryName),
    );
  }

  if (sort === "name-desc") {
    return items.sort((left, right) =>
      right.countryName.localeCompare(left.countryName),
    );
  }

  return items.sort((left, right) => (right.population ?? 0) - (left.population ?? 0));
}

function sortCities(cities, sort) {
  const items = [...cities];

  if (sort === "temperature-desc") {
    return items.sort(
      (left, right) => (right.temperature ?? -999) - (left.temperature ?? -999),
    );
  }

  if (sort === "temperature-asc") {
    return items.sort(
      (left, right) => (left.temperature ?? 999) - (right.temperature ?? 999),
    );
  }

  if (sort === "name-asc") {
    return items.sort((left, right) => left.place.localeCompare(right.place));
  }

  return items;
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const mode = searchParams.get("mode") ?? "all";
  const population = searchParams.get("population") ?? "all";
  const language = searchParams.get("language") ?? "";
  const requestedSort = searchParams.get("sort");
  const debouncedQuery = useDebounce(query);
  const activeRegion = useAppStore((state) => state.activeRegion);
  const setActiveRegion = useAppStore((state) => state.setActiveRegion);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const addRecentSearch = useAppStore((state) => state.addRecentSearch);
  const sortOptions = getSortOptions(mode);
  const sort = sortOptions.some((option) => option.value === requestedSort)
    ? requestedSort
    : sortOptions[0].value;

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value == null || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next);
  };

  const countriesQuery = useQuery({
    queryKey: queryKeys.countries,
    queryFn: getAllCountries,
  });

  const geocodeQuery = useQuery({
    queryKey: queryKeys.geocode(debouncedQuery),
    queryFn: () => searchDestinations(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2 && mode !== "countries",
  });

  useEffect(() => {
    if (requestedSort && requestedSort !== sort) {
      updateParams({ sort });
    }
  }, [requestedSort, sort]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      addRecentSearch(debouncedQuery.trim());
    }
  }, [addRecentSearch, debouncedQuery]);

  const filteredCountries = useMemo(() => {
    const countries = countriesQuery.data ?? [];
    const phrase = debouncedQuery.toLowerCase();
    const languagePhrase = language.trim().toLowerCase();

    return countries
      .filter((country) =>
        activeRegion === "all"
          ? true
          : country.region?.toLowerCase() === activeRegion.toLowerCase(),
      )
      .filter((country) => {
        if (!debouncedQuery) {
          return true;
        }

        return (
          country.name.common.toLowerCase().includes(phrase) ||
          country.capital?.some((capital) => capital.toLowerCase().includes(phrase))
        );
      })
      .filter((country) => matchesPopulation(country.population ?? 0, population))
      .filter((country) => {
        if (!languagePhrase) {
          return true;
        }

        return Object.values(country.languages ?? {}).some((item) =>
          item.toLowerCase().includes(languagePhrase),
        );
      })
      .map((country) => ({
        id: country.cca2,
        countryCode: country.cca2.toLowerCase(),
        countryName: country.name.common,
        place: country.capital?.[0] || country.name.common,
        lat: country.latlng?.[0] ?? 0,
        lng: country.latlng?.[1] ?? 0,
        flag: country.flags?.svg || country.flags?.png,
        region: country.region,
        capital: country.capital?.[0],
        population: country.population,
        languages: Object.values(country.languages ?? {}),
        summary: `${country.name.common} offers a live destination intelligence entry point with country context, weather, and regional positioning.`,
      }));
  }, [activeRegion, countriesQuery.data, debouncedQuery, language, population]);

  const sortedCountries = useMemo(
    () => sortCountries(filteredCountries, sort).slice(0, 12),
    [filteredCountries, sort],
  );

  const geocodedPlaceBase = useMemo(
    () =>
      (geocodeQuery.data ?? []).map((result) => ({
        id: result.id,
        countryCode: (result.country_code ?? "xx").toLowerCase(),
        countryName: result.country ?? "Unknown",
        place: result.name,
        lat: result.latitude,
        lng: result.longitude,
        flag: "",
        region: result.admin1 || "Geocoded place",
        capital: result.name,
        summary: `${result.name} is being resolved from Open-Meteo geocoding, making it a direct bridge into live climate data without any mock content.`,
      })),
    [geocodeQuery.data],
  );

  const cityWeatherQueries = useQueries({
    queries: geocodedPlaceBase.map((place) => ({
      queryKey: queryKeys.forecast(place.lat, place.lng),
      queryFn: () => getForecast(place.lat, place.lng),
      enabled: mode !== "countries",
      staleTime: 1000 * 60 * 15,
    })),
  });

  const geocodedPlaces = useMemo(() => {
    const placesWithWeather = geocodedPlaceBase.map((place, index) => ({
      ...place,
      temperature: cityWeatherQueries[index]?.data?.current?.temperature_2m ?? null,
    }));

    return sortCities(placesWithWeather, sort).slice(0, 12);
  }, [cityWeatherQueries, geocodedPlaceBase, sort]);

  const summaryCards = [
    {
      label: "Country matches",
      value: formatNumber(filteredCountries.length),
      description:
        "Filtered from the live country dataset by region, search phrase, population band, and language.",
    },
    {
      label: "City matches",
      value: formatNumber(geocodedPlaceBase.length),
      description:
        "Resolved through Open-Meteo geocoding and enriched with current weather snapshots for discovery.",
    },
    {
      label: "Active region",
      value: activeRegion === "all" ? "Global" : activeRegion,
      description:
        "Region scope stays in sync with the global store, so exploration can become a broader product behavior.",
    },
  ];

  const showCountryResults = mode === "all" || mode === "countries";
  const showCityResults = mode === "all" || mode === "cities";
  const needsCitySearch = mode === "cities" && debouncedQuery.trim().length < 2;

  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Explore"
          title="Search countries, capitals, and cities through a live intelligence layer."
          description="This batch begins the discovery phase: grouped result views, richer filtering, live city weather snapshots, and URL-backed explorer state."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              description={card.description}
            />
          ))}
        </div>

        <div className="surface-panel mt-8 p-5">
          <div className="flex flex-wrap gap-3">
            {MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateParams({ mode: option.value, sort: "" })}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  mode === option.value
                    ? "border-neon/40 bg-neon/10 text-neon"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.5fr_0.75fr_0.75fr]">
            <Input
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                updateParams({ q: value });
                setSearchQuery(value);
              }}
              placeholder="Search for Addis Ababa, Japan, Lisbon, Nairobi..."
              icon={Search}
              className="h-14 text-base"
            />
            <SelectField
              value={sort}
              options={sortOptions}
              onChange={(event) => updateParams({ sort: event.target.value })}
            />
            <SelectField
              value={population}
              options={POPULATION_OPTIONS}
              onChange={(event) =>
                updateParams({ population: event.target.value })
              }
              disabled={mode === "cities"}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Input
              value={language}
              onChange={(event) => updateParams({ language: event.target.value })}
              placeholder="Filter countries by language..."
              className="h-12"
              disabled={mode === "cities"}
            />
            <ShellCard className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neon">
                <Layers3 size={18} />
              </div>
              <p className="text-sm leading-7 text-slate-400">
                Discovery controls are encoded in the URL, so explore states are
                shareable and can grow into a stronger product navigation model.
              </p>
            </ShellCard>
          </div>

          <div className="mt-5">
            <ExploreFilters
              activeRegion={activeRegion}
              onChange={setActiveRegion}
            />
          </div>
        </div>

        {countriesQuery.isLoading ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        ) : null}

        {countriesQuery.isError ? (
          <div className="mt-10">
            <ErrorState description={countriesQuery.error.message} />
          </div>
        ) : null}

        {geocodeQuery.isError ? (
          <div className="mt-10">
            <ErrorState
              title="City search is unavailable right now."
              description={geocodeQuery.error.message}
            />
          </div>
        ) : null}

        {needsCitySearch ? (
          <div className="mt-10">
            <EmptyState
              title="Search for a city to unlock live discovery."
              description="City mode is powered by Open-Meteo geocoding. Type at least two characters to resolve live destinations with current weather snapshots."
            />
          </div>
        ) : null}

        {showCityResults && geocodedPlaces.length ? (
          <div className="mt-12">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">City discovery</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  Live geocoded places with current temperature snapshots from
                  Open-Meteo.
                </p>
              </div>
              <p className="text-sm text-slate-500">
                {formatNumber(geocodedPlaces.length)} visible results
              </p>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {geocodedPlaces.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          </div>
        ) : null}

        {showCountryResults && !countriesQuery.isLoading && !countriesQuery.isError ? (
          <div className="mt-12">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Country intelligence
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  Filtered country results from REST Countries, prepared as richer
                  destination cards for the broader product flow.
                </p>
              </div>
              <p className="text-sm text-slate-500">
                {formatNumber(sortedCountries.length)} visible results
              </p>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {sortedCountries.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          </div>
        ) : null}

        {showCountryResults &&
        !countriesQuery.isLoading &&
        !countriesQuery.isError &&
        !sortedCountries.length ? (
          <div className="mt-10">
            <EmptyState
              title="No country matches for these filters."
              description="Try widening the region, clearing the language filter, or switching the population band to broaden the discovery set."
            />
          </div>
        ) : null}

        {showCityResults &&
        !needsCitySearch &&
        !geocodeQuery.isFetching &&
        !geocodeQuery.isError &&
        !geocodedPlaces.length ? (
          <div className="mt-10">
            <EmptyState
              title="No city matches found."
              description="Try another city or capital name, or switch to country mode to browse the indexed country set instead."
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
