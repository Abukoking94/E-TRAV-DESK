import { describeWeatherCode } from "../../lib/destinationInsights";
import { TRAVEL_PROFILE_OPTIONS } from "../../lib/scoring/travelProfileScore";
import { MONTH_META } from "../../lib/seasonality";

const savedPlanningPalette = [
  "#2797ff",
  "#8edbff",
  "#5ab6ff",
  "#7c9cff",
  "#4ce4b7",
  "#ff8a65",
];

const travelProfileLabelMap = new Map(
  TRAVEL_PROFILE_OPTIONS.map((profile) => [profile.value, profile.label]),
);

export function formatRelativeTime(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) {
    return "Recently";
  }

  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${Math.max(diffMinutes, 1)} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day ago`;
}

export function buildSavedCard(destination, country, forecast) {
  const current = forecast?.current ?? {};
  const daily = forecast?.daily ?? {};

  return {
    ...destination,
    id: `${destination.countryCode}-${destination.place}`,
    countryName: destination.country,
    flag: destination.flag || country?.flags?.svg || country?.flags?.png,
    region: country?.region || "Saved",
    capital: country?.capital?.[0] || destination.place,
    population: country?.population,
    journeyName: destination.journeyName || "Unassigned",
    weatherLabel: describeWeatherCode(current.weather_code),
    temperature: current.temperature_2m ?? null,
    windSpeed: current.wind_speed_10m ?? null,
    rainChance: daily.precipitation_probability_max?.[0] ?? null,
    savedAtLabel: formatRelativeTime(destination.savedAt),
  };
}

export function buildJourneyMetrics(journeys, destinations) {
  return journeys.map((journey) => ({
    ...journey,
    count: destinations.filter((destination) => destination.journeyId === journey.id)
      .length,
    pinnedCount: destinations.filter(
      (destination) => destination.journeyId === journey.id && destination.pinned,
    ).length,
  }));
}

function getWindowForSize(plan, size) {
  return (
    plan?.rankedWindows?.find((window) => window.size === size) ??
    plan?.recommendedWindow ??
    null
  );
}

function getMonthData(plan, month) {
  return plan?.scoredMonths?.find((item) => item.month === month) ?? null;
}

function formatMonthLabel(month) {
  return MONTH_META.find((item) => item.month === month)?.fullLabel ?? `Month ${month}`;
}

export function formatSavedPlanningPreferences(preferences) {
  if (!preferences) {
    return "No saved planning profile.";
  }

  const profileLabel =
    travelProfileLabelMap.get(preferences.profileId) ?? "Travel profile";
  const modeLabel =
    preferences.mode === "best-window"
      ? `${preferences.windowSize}-month window`
      : formatMonthLabel(preferences.selectedMonth);

  return `${profileLabel} / ${modeLabel}`;
}

export function buildSavedPlanningEntries({
  destinations,
  travelWindowPlans,
  riskSnapshotMap,
  mode,
  selectedMonth,
  windowSize,
}) {
  return destinations
    .map((destination, index) => {
      const plan = travelWindowPlans[index] ?? null;
      const monthData = getMonthData(plan, selectedMonth);
      const window = getWindowForSize(plan, windowSize);
      const rankingScore =
        mode === "best-window" ? window?.score ?? null : monthData?.score ?? null;

      return {
        ...destination,
        chartKey: `saved_${index + 1}`,
        color: savedPlanningPalette[index % savedPlanningPalette.length],
        plan,
        monthData,
        window,
        rankingScore,
        averageScore: plan?.scoreAverage ?? null,
        topMonth: plan?.topMonth ?? null,
        riskSnapshot:
          riskSnapshotMap.get(`${destination.countryCode}:${destination.place}`) ?? null,
      };
    })
    .sort((left, right) => {
      const rightScore = right.rankingScore ?? -1;
      const leftScore = left.rankingScore ?? -1;

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return (right.averageScore ?? -1) - (left.averageScore ?? -1);
    });
}

export function buildSavedPlanningSummary(entries) {
  const comparableEntries = entries.filter((entry) => entry.rankingScore != null);
  const leader = comparableEntries[0] ?? entries[0] ?? null;
  const quietestEntry =
    [...entries]
      .filter((entry) => entry.riskSnapshot?.score != null)
      .sort(
        (left, right) =>
          (left.riskSnapshot?.score ?? Number.POSITIVE_INFINITY) -
          (right.riskSnapshot?.score ?? Number.POSITIVE_INFINITY),
      )[0] ?? null;

  const bestMonthOverall =
    [...MONTH_META]
      .map((monthMeta) => {
        const scores = entries
          .map(
            (entry) =>
              entry.plan?.scoredMonths?.find((item) => item.month === monthMeta.month)
                ?.score ?? null,
          )
          .filter((value) => value != null);

        const averageScore = scores.length
          ? Math.round(scores.reduce((total, value) => total + value, 0) / scores.length)
          : null;

        return {
          ...monthMeta,
          averageScore,
        };
      })
      .filter((monthMeta) => monthMeta.averageScore != null)
      .sort((left, right) => (right.averageScore ?? 0) - (left.averageScore ?? 0))[0] ??
    null;

  return {
    leader,
    quietestEntry,
    bestMonthOverall,
    comparableCount: comparableEntries.length,
    activeRiskCount: entries.reduce(
      (total, entry) => total + (entry.riskSnapshot?.openCount ?? 0),
      0,
    ),
    averageScore: comparableEntries.length
      ? Math.round(
          comparableEntries.reduce(
            (total, entry) => total + (entry.rankingScore ?? 0),
            0,
          ) / comparableEntries.length,
        )
      : null,
  };
}

export function buildSavedPlanningChartData(entries) {
  return MONTH_META.map(({ month, label, fullLabel }) => {
    const row = { month, label, fullLabel };

    entries.forEach((entry) => {
      row[entry.chartKey] =
        entry.plan?.scoredMonths?.find((item) => item.month === month)?.score ?? null;
    });

    return row;
  });
}

export function buildRecentCards(recentDestinations, countries) {
  return recentDestinations.map((destination) => {
    const country = countries.find(
      (item) => item.cca2.toLowerCase() === destination.countryCode,
    );

    return {
      ...destination,
      id: `${destination.countryCode}-${destination.place}`,
      countryName: destination.country,
      flag: destination.flag || country?.flags?.svg || country?.flags?.png,
      region: country?.region || "Recent",
      viewedAtLabel: formatRelativeTime(destination.viewedAt),
    };
  });
}
