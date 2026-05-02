import { MONTH_META } from "../../lib/seasonality";

function dedupeDestinations(destinations) {
  const seen = new Set();

  return destinations.filter((destination) => {
    const key = `${destination.countryCode}:${destination.place}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeSavedOrCompareDestination(destination, countries) {
  const country = countries.find(
    (item) => item.cca2.toLowerCase() === destination.countryCode,
  );

  return {
    id: `${destination.countryCode}:${destination.place}`,
    countryCode: destination.countryCode,
    place: destination.place,
    countryName: country?.name?.common ?? destination.country ?? destination.place,
    region: country?.region ?? "Destination",
    lat: destination.lat,
    lng: destination.lng,
    flag: destination.flag || country?.flags?.svg || country?.flags?.png,
    source: destination.savedAt ? "saved" : "compare",
  };
}

function normalizeCountryCandidate(country) {
  const lat = country.capitalInfo?.latlng?.[0] ?? country.latlng?.[0] ?? null;
  const lng = country.capitalInfo?.latlng?.[1] ?? country.latlng?.[1] ?? null;
  const place = country.capital?.[0] || country.name.common;

  return {
    id: `${country.cca2.toLowerCase()}:${place}`,
    countryCode: country.cca2.toLowerCase(),
    place,
    countryName: country.name.common,
    region: country.region ?? "Destination",
    lat,
    lng,
    flag: country.flags?.svg || country.flags?.png,
    source: "atlas",
  };
}

export function buildPlannerCandidatePool({
  savedDestinations = [],
  compareDestinations = [],
  countries = [],
}) {
  const prioritized = [
    ...compareDestinations.map((destination) =>
      normalizeSavedOrCompareDestination(destination, countries),
    ),
    ...savedDestinations.map((destination) =>
      normalizeSavedOrCompareDestination(destination, countries),
    ),
  ];

  const atlasPool = countries.map(normalizeCountryCandidate);

  return dedupeDestinations([...prioritized, ...atlasPool]).filter(
    (destination) =>
      Number.isFinite(destination.lat) && Number.isFinite(destination.lng),
  );
}

export function filterPlannerCandidates(candidates, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return candidates.slice(0, 18);
  }

  return candidates
    .filter((candidate) => {
      const haystack = [
        candidate.place,
        candidate.countryName,
        candidate.region,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .slice(0, 18);
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

export function buildPlannerEntries({
  selectedDestinations,
  travelWindowPlans,
  mode,
  selectedMonth,
  windowSize,
}) {
  return selectedDestinations
    .map((destination, index) => {
      const plan = travelWindowPlans[index] ?? null;
      const monthData = getMonthData(plan, selectedMonth);
      const window = getWindowForSize(plan, windowSize);
      const rankingScore =
        mode === "best-window" ? window?.score ?? null : monthData?.score ?? null;

      return {
        ...destination,
        plan,
        monthData,
        window,
        rankingScore,
        averageScore: plan?.scoreAverage ?? null,
      };
    })
    .sort((left, right) => (right.rankingScore ?? -1) - (left.rankingScore ?? -1));
}

export function buildPlannerSummary(entries, mode) {
  const leader = entries[0] ?? null;

  return {
    leader,
    mode,
    comparableCount: entries.filter((entry) => entry.rankingScore != null).length,
    averageScore:
      entries.length > 0
        ? Math.round(
            entries.reduce((total, entry) => total + (entry.rankingScore ?? 0), 0) /
              entries.length,
          )
        : null,
  };
}

export function buildPlannerChartData(entries) {
  return MONTH_META.map(({ month, label, fullLabel }) => {
    const row = { month, label, fullLabel };

    entries.forEach((entry, index) => {
      row[`planner_${index + 1}`] =
        entry.plan?.scoredMonths?.find((item) => item.month === month)?.score ?? null;
    });

    return row;
  });
}
