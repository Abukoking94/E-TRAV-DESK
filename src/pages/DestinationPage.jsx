import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock3,
  Compass,
  Globe2,
  MapPinned,
  MoonStar,
  Sparkles,
  SunMedium,
  Wind,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ForecastChart } from "../components/charts/ForecastChart";
import { Badge } from "../components/ui/Badge";
import { ErrorState } from "../components/ui/ErrorState";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ShellCard } from "../components/ui/ShellCard";
import { Skeleton } from "../components/ui/Skeleton";
import { DestinationEconomicPanel } from "../features/destination/components/DestinationEconomicPanel";
import { DestinationReadinessPanel } from "../features/destination/components/DestinationReadinessPanel";
import { DestinationRouteMap } from "../features/destination/components/DestinationRouteMap";
import { DestinationSeasonalityPanel } from "../features/destination/components/DestinationSeasonalityPanel";
import { DestinationTravelWindowsPanel } from "../features/destination/components/DestinationTravelWindowsPanel";
import { DestinationRiskPanel } from "../features/risk/components/DestinationRiskPanel";
import { buildDevelopmentProfile } from "../lib/developmentInsights";
import { useDestinationTime } from "../hooks/useDestinationTime";
import {
  buildClimateNarrative,
  buildTravelMoodTags,
  describeAqi,
  summarizeVisitWindow,
} from "../lib/destinationInsights";
import { buildRiskBbox, buildRiskSnapshot } from "../lib/risk";
import { TRAVEL_PROFILE_OPTIONS } from "../lib/scoring/travelProfileScore";
import { buildTravelWindowPlan } from "../lib/scoring/travelWindowScore";
import { buildSeasonalityDateRange } from "../lib/seasonality";
import {
  formatNumber,
  formatPercent,
  formatTemp,
} from "../lib/formatters";
import {
  getCountriesByCodes,
  getCountryByCode,
} from "../services/api/countries.api";
import { getNearbyEvents } from "../services/api/eonet.api";
import {
  getAirQuality,
  getForecast,
  getHistoricalDailyWeather,
  getMarine,
} from "../services/api/openMeteo.api";
import { getCountryDevelopmentIndicators } from "../services/api/worldBank.api";
import { getDestinationSummary } from "../services/api/wikipedia.api";
import { mapDestinationOverview } from "../services/mappers/destination.mapper";
import { mapRiskEvents } from "../services/mappers/risk.mapper";
import { mapHistoricalSeasonalityProfile } from "../services/mappers/seasonality.mapper";
import { queryKeys } from "../services/query/queryKeys";
import { useAppStore } from "../store/useAppStore";

function formatApiClock(value) {
  if (!value) {
    return "Unavailable";
  }

  const time = value.split("T")[1];

  if (!time) {
    return value;
  }

  const [rawHour = "0", minute = "00"] = time.split(":");
  const hour = Number.parseInt(rawHour, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;

  return `${normalized}:${minute} ${suffix}`;
}

export function DestinationPage() {
  const { countryCode } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedTravelProfile, setSelectedTravelProfile] = useState(
    TRAVEL_PROFILE_OPTIONS[0].value,
  );
  const addRecentDestination = useAppStore((state) => state.addRecentDestination);
  const historicalRange = useMemo(() => buildSeasonalityDateRange(), []);
  const riskWindowDays = 21;

  const countryQuery = useQuery({
    queryKey: queryKeys.country(countryCode),
    queryFn: () => getCountryByCode(countryCode),
  });

  const coords = useMemo(() => {
    const lat = Number.parseFloat(searchParams.get("lat"));
    const lng = Number.parseFloat(searchParams.get("lng"));

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }

    const capitalCoords = countryQuery.data?.capitalInfo?.latlng;
    const baseCoords = countryQuery.data?.latlng;
    return {
      lat: capitalCoords?.[0] ?? baseCoords?.[0] ?? 0,
      lng: capitalCoords?.[1] ?? baseCoords?.[1] ?? 0,
    };
  }, [countryQuery.data, searchParams]);

  const place =
    searchParams.get("place") ||
    countryQuery.data?.capital?.[0] ||
    countryQuery.data?.name.common;

  const hasCoords =
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    !(coords.lat === 0 && coords.lng === 0);

  const forecastQuery = useQuery({
    queryKey: queryKeys.forecast(coords.lat, coords.lng),
    queryFn: () => getForecast(coords.lat, coords.lng),
    enabled: hasCoords,
  });

  const airQualityQuery = useQuery({
    queryKey: queryKeys.airQuality(coords.lat, coords.lng),
    queryFn: () => getAirQuality(coords.lat, coords.lng),
    enabled: hasCoords,
  });

  const developmentQuery = useQuery({
    queryKey: queryKeys.worldBank(countryCode),
    queryFn: () => getCountryDevelopmentIndicators(countryCode),
    enabled: Boolean(countryCode),
  });

  const marineQuery = useQuery({
    queryKey: queryKeys.marine(coords.lat, coords.lng),
    queryFn: () => getMarine(coords.lat, coords.lng),
    enabled: hasCoords,
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.summary(countryQuery.data?.name.common),
    queryFn: () => getDestinationSummary(countryQuery.data.name.common),
    enabled: Boolean(countryQuery.data?.name.common),
  });

  const seasonalityTimezone =
    forecastQuery.data?.timezone ||
    countryQuery.data?.timezones?.[0] ||
    "auto";

  const historicalWeatherQuery = useQuery({
    queryKey: queryKeys.historicalWeather(
      coords.lat,
      coords.lng,
      historicalRange.startDate,
      historicalRange.endDate,
      seasonalityTimezone,
    ),
    queryFn: () =>
      getHistoricalDailyWeather(coords.lat, coords.lng, {
        startDate: historicalRange.startDate,
        endDate: historicalRange.endDate,
        timezone: seasonalityTimezone,
      }),
    enabled: hasCoords,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const destinationRiskBbox = useMemo(
    () => (hasCoords ? buildRiskBbox(coords.lat, coords.lng) : null),
    [coords.lat, coords.lng, hasCoords],
  );

  const destinationRiskQuery = useQuery({
    queryKey: queryKeys.nearbyEvents({
      bbox: destinationRiskBbox,
      days: riskWindowDays,
      status: "open",
      limit: 18,
      scope: "destination",
      countryCode,
    }),
    queryFn: () =>
      getNearbyEvents({
        bbox: destinationRiskBbox,
        days: riskWindowDays,
        status: "open",
        limit: 18,
      }),
    enabled: Boolean(destinationRiskBbox),
    staleTime: 1000 * 60 * 30,
  });

  const borderCountriesQuery = useQuery({
    queryKey: queryKeys.borderCountries(countryQuery.data?.borders?.join(",") || "none"),
    queryFn: () => getCountriesByCodes(countryQuery.data.borders),
    enabled: Boolean(countryQuery.data?.borders?.length),
  });

  const destination = useMemo(() => {
    if (!countryQuery.data) {
      return null;
    }

    return mapDestinationOverview({
      country: countryQuery.data,
      forecast: forecastQuery.data,
      airQuality: airQualityQuery.data,
      marine: marineQuery.data,
      summary: summaryQuery.data,
      development: developmentQuery.data,
      place,
      lat: coords.lat,
      lng: coords.lng,
    });
  }, [
    airQualityQuery.data,
    coords.lat,
    coords.lng,
    countryQuery.data,
    developmentQuery.data,
    forecastQuery.data,
    marineQuery.data,
    place,
    summaryQuery.data,
  ]);

  const localTime = useDestinationTime(destination?.timezoneName);

  const climateSummary = useMemo(
    () => (destination ? buildClimateNarrative(destination) : null),
    [destination],
  );

  const travelMoodTags = useMemo(
    () => (destination ? buildTravelMoodTags(destination) : []),
    [destination],
  );

  const visitWindow = useMemo(
    () => (destination ? summarizeVisitWindow(destination) : ""),
    [destination],
  );

  const developmentProfile = useMemo(
    () => buildDevelopmentProfile(destination?.development),
    [destination?.development],
  );

  const aqiSummary = useMemo(
    () => describeAqi(destination?.airQuality?.us_aqi),
    [destination?.airQuality?.us_aqi],
  );

  const seasonalityProfile = useMemo(
    () =>
      historicalWeatherQuery.data
        ? mapHistoricalSeasonalityProfile(historicalWeatherQuery.data)
        : null,
    [historicalWeatherQuery.data],
  );

  const travelWindowPlan = useMemo(
    () =>
      seasonalityProfile
        ? buildTravelWindowPlan(seasonalityProfile, selectedTravelProfile)
        : null,
    [seasonalityProfile, selectedTravelProfile],
  );

  const destinationRiskSnapshot = useMemo(
    () =>
      destinationRiskQuery.data
        ? buildRiskSnapshot(mapRiskEvents(destinationRiskQuery.data), {
            days: riskWindowDays,
            scopeLabel: `${place} vicinity`,
          })
        : null,
    [destinationRiskQuery.data, place, riskWindowDays],
  );

  useEffect(() => {
    if (!destination) {
      return;
    }

    addRecentDestination({
      countryCode: destination.countryCode,
      country: destination.countryName,
      place: destination.place,
      lat: destination.lat,
      lng: destination.lng,
    });
  }, [addRecentDestination, destination]);

  if (countryQuery.isLoading) {
    return (
      <section className="section-space">
        <div className="page-shell space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-96" />
        </div>
      </section>
    );
  }

  if (countryQuery.isError || !destination) {
    return (
      <section className="section-space">
        <div className="page-shell">
          <ErrorState description={countryQuery.error?.message || "Destination unavailable."} />
        </div>
      </section>
    );
  }

  const sunrise = destination.daily?.sunrise?.[0];
  const sunset = destination.daily?.sunset?.[0];
  const sunshineHours = destination.daily?.sunshine_duration?.[0]
    ? Math.round(destination.daily.sunshine_duration[0] / 3600)
    : null;
  const borderCountries = borderCountriesQuery.data ?? [];

  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="glass-panel rounded-[32px] p-6 sm:p-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-neon">
                {destination.region} intelligence node
              </p>
              <div className="mt-4 flex items-start gap-4">
                {destination.flag ? (
                  <img
                    src={destination.flag}
                    alt={destination.countryName}
                    decoding="async"
                    className="h-16 w-16 rounded-[24px] object-cover"
                  />
                ) : null}
                <div>
                  <h1 className="font-display text-4xl font-semibold text-white sm:text-6xl">
                    {destination.place}
                  </h1>
                  <p className="mt-3 text-lg text-slate-300">
                    {destination.countryName}
                  </p>
                </div>
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-400 sm:text-base">
                {destination.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {travelMoodTags.map((tag) => (
                  <Badge
                    key={tag}
                    className="normal-case tracking-normal text-slate-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <ShellCard>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Current temperature
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {formatTemp(destination.current?.temperature_2m)}
                  </p>
                </ShellCard>
                <ShellCard>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Comfort score
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {climateSummary?.comfortScore ?? "N/A"}
                  </p>
                </ShellCard>
                <ShellCard>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Local time
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {localTime.timeLabel}
                  </p>
                </ShellCard>
              </div>
            </div>

            <ShellCard className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-neon/20 bg-neon/10 p-3 text-neon">
                  <Compass size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Destination profile</p>
                  <p className="text-xs text-slate-500">
                    Coordinates {coords.lat.toFixed(2)}, {coords.lng.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Population</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatNumber(destination.population)}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Area</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatNumber(destination.area)} sq km
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Humidity</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatPercent(destination.current?.relative_humidity_2m)}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Feels like</p>
                  <p className="mt-2 font-semibold text-white">
                    {formatTemp(destination.current?.apparent_temperature)}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Local date</p>
                  <p className="mt-2 text-sm leading-7 text-white">
                    {localTime.dateLabel}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Timezone</p>
                  <p className="mt-2 text-sm leading-7 text-white">
                    {destination.timezoneName ||
                      destination.timezoneAbbreviation ||
                      destination.timezones[0] ||
                      "Unavailable"}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Currencies</p>
                  <p className="mt-2 text-sm leading-7 text-white">
                    {destination.currencies.join(", ") || "Unavailable"}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Languages</p>
                  <p className="mt-2 text-sm leading-7 text-white">
                    {destination.languages.join(", ") || "Unavailable"}
                  </p>
                </div>
              </div>
            </ShellCard>
          </div>
        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <ShellCard>
            <SectionHeading
              eyebrow="Forecast"
              title="Seven-day climate signal"
              description="Live forecast pulled directly from Open-Meteo and shaped into a premium visual panel."
            />
            <div className="mt-8">
              <ForecastChart daily={destination.daily} />
            </div>
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm leading-8 text-slate-300">{visitWindow}</p>
            </div>
          </ShellCard>

          <div className="grid gap-8">
            <ShellCard>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-neon">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="font-medium text-white">Travel readiness</p>
                  <p className="text-sm text-slate-500">
                    A more readable interpretation layer for the current destination conditions.
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Current condition</p>
                  <p className="mt-2 font-semibold text-white">
                    {climateSummary?.weatherLabel || "Unavailable"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    {climateSummary?.readiness}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Rain pattern</p>
                  <p className="mt-2 text-sm leading-7 text-white">
                    {climateSummary?.precipitationNote}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Sunshine outlook</p>
                  <p className="mt-2 text-sm leading-7 text-white">
                    {climateSummary?.sunshineNote}
                  </p>
                </div>
              </div>
            </ShellCard>

            <ShellCard>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-aurora">
                  <Wind size={20} />
                </div>
                <div>
                  <p className="font-medium text-white">Air quality detail</p>
                  <p className="text-sm text-slate-500">
                    Live particulate data for the selected destination.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">US AQI</p>
                  <p className="mt-2 font-semibold text-white">
                    {destination.airQuality?.us_aqi ?? "N/A"}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">PM10</p>
                  <p className="mt-2 font-semibold text-white">
                    {destination.airQuality?.pm10 ?? "N/A"}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">PM2.5</p>
                  <p className="mt-2 font-semibold text-white">
                    {destination.airQuality?.pm2_5 ?? "N/A"}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-500">AQI read</p>
                <p className="mt-2 font-semibold text-white">{aqiSummary.label}</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {aqiSummary.tone}
                </p>
              </div>
            </ShellCard>

            <ShellCard>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-neon">
                  <Globe2 size={20} />
                </div>
                <div>
                  <p className="font-medium text-white">Marine layer</p>
                  <p className="text-sm text-slate-500">
                    Useful for coastal destinations and future surf or sailing views.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Wave height</p>
                  <p className="mt-2 font-semibold text-white">
                    {destination.marine?.wave_height ?? "N/A"}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Wave period</p>
                  <p className="mt-2 font-semibold text-white">
                    {destination.marine?.wave_period ?? "N/A"}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Wave direction</p>
                  <p className="mt-2 font-semibold text-white">
                    {destination.marine?.wave_direction ?? "N/A"}
                  </p>
                </div>
              </div>
            </ShellCard>
          </div>
        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <DestinationSeasonalityPanel
            seasonalityProfile={seasonalityProfile}
            travelWindowPlan={travelWindowPlan}
            selectedProfileId={selectedTravelProfile}
            onProfileChange={setSelectedTravelProfile}
            isLoading={historicalWeatherQuery.isLoading}
            isError={historicalWeatherQuery.isError}
            errorMessage={historicalWeatherQuery.error?.message}
            historicalRange={historicalRange}
          />
          <DestinationTravelWindowsPanel
            travelWindowPlan={travelWindowPlan}
            isLoading={historicalWeatherQuery.isLoading}
            isError={historicalWeatherQuery.isError}
            errorMessage={historicalWeatherQuery.error?.message}
          />
        </div>

        <div className="mt-12">
          <DestinationRiskPanel
            riskSnapshot={destinationRiskSnapshot}
            isLoading={destinationRiskQuery.isLoading}
            isError={destinationRiskQuery.isError}
            errorMessage={destinationRiskQuery.error?.message}
          />
        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <ShellCard>
            <SectionHeading
              eyebrow="Context"
              title="Country context and sun cycle"
              description="Tie the weather and climate signals back to the identity and operating conditions of the destination."
            />
            <div className="mt-8 grid gap-4">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-atlas-950/60 p-3 text-neon">
                    <MapPinned size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-white">Official country name</p>
                    <p className="text-sm text-slate-400">{destination.officialName}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-atlas-950/60 p-3 text-aurora">
                      <SunMedium size={18} />
                    </div>
                    <div>
                      <p className="text-slate-500">Sunrise</p>
                      <p className="mt-2 font-semibold text-white">
                        {formatApiClock(sunrise)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-atlas-950/60 p-3 text-aurora">
                      <MoonStar size={18} />
                    </div>
                    <div>
                      <p className="text-slate-500">Sunset</p>
                      <p className="mt-2 font-semibold text-white">
                        {formatApiClock(sunset)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-atlas-950/60 p-3 text-neon">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <p className="text-slate-500">Sunshine duration</p>
                      <p className="mt-2 font-semibold text-white">
                        {sunshineHours != null ? `${sunshineHours} hrs` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-atlas-950/60 p-3 text-neon">
                      <Globe2 size={18} />
                    </div>
                    <div>
                      <p className="text-slate-500">Subregion</p>
                      <p className="mt-2 font-semibold text-white">
                        {destination.subregion || destination.region || "Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-slate-500">Continental placement</p>
                <p className="mt-2 text-sm leading-7 text-white">
                  {destination.continents.join(", ") || "Unavailable"}
                </p>
              </div>
            </div>
          </ShellCard>

          <ShellCard>
            <SectionHeading
              eyebrow="Neighbors"
              title="Regional border intelligence"
              description="Neighboring countries make the destination route feel connected to the rest of the atlas, not isolated from it."
            />
            <div className="mt-8">
              {borderCountriesQuery.isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                </div>
              ) : borderCountries.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {borderCountries.map((neighbor) => (
                    <Link
                      key={neighbor.cca2}
                      to={`/destination/${neighbor.cca2.toLowerCase()}`}
                      className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:border-neon/25 hover:bg-white/[0.07]"
                    >
                      <div className="flex items-center gap-4">
                        {neighbor.flags?.svg || neighbor.flags?.png ? (
                          <img
                            src={neighbor.flags?.svg || neighbor.flags?.png}
                            alt={neighbor.name.common}
                            loading="lazy"
                            decoding="async"
                            className="h-12 w-12 rounded-2xl object-cover"
                          />
                        ) : null}
                        <div>
                          <p className="font-semibold text-white">
                            {neighbor.name.common}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {neighbor.region || "Region"} /{" "}
                            {neighbor.capital?.[0] || "Capital unavailable"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm leading-7 text-slate-400">
                    This destination does not currently expose bordering-country
                    links through the available country data.
                  </p>
                </div>
              )}
            </div>
          </ShellCard>
        </div>

        <div className="mt-12">
          <DestinationRouteMap
            destination={destination}
            borderCountries={borderCountries}
          />
        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <DestinationEconomicPanel
            indicators={destination.development}
            isLoading={developmentQuery.isLoading && !destination.development}
            isUnavailable={developmentQuery.isError && !destination.development}
          />
          <DestinationReadinessPanel
            profile={developmentProfile}
            isUnavailable={developmentQuery.isError && !destination.development}
          />
        </div>
      </div>
    </section>
  );
}
