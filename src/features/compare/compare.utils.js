import {
  calculateComfortScore,
  describeAqi,
  describeWeatherCode,
} from "../../lib/destinationInsights";
import { MONTH_META } from "../../lib/seasonality";

export const comparePalette = ["#2797ff", "#8edbff", "#5ab6ff"];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getCurrencyNames(currencies) {
  return Object.values(currencies ?? {})
    .map((item) => item?.name)
    .filter(Boolean);
}

function getLanguageNames(languages) {
  return Object.values(languages ?? {}).filter(Boolean);
}

function calculateWarmthScore(temperature) {
  if (temperature == null || Number.isNaN(temperature)) {
    return 50;
  }

  return clamp(Math.round(100 - Math.abs(temperature - 26) * 4.4), 20, 96);
}

function calculateAirScore(aqi) {
  if (aqi == null || Number.isNaN(aqi)) {
    return 54;
  }

  return clamp(Math.round(100 - Math.max(aqi - 12, 0) * 0.55), 12, 98);
}

function calculateDrynessScore(rainChance, precipitation) {
  const normalizedChance = rainChance ?? 35;
  const normalizedPrecipitation = precipitation ?? 3;
  const rawScore =
    100 - normalizedChance * 0.58 - normalizedPrecipitation * 3.4;

  return clamp(Math.round(rawScore), 14, 98);
}

function calculateCalmScore(windSpeed) {
  if (windSpeed == null || Number.isNaN(windSpeed)) {
    return 58;
  }

  return clamp(Math.round(100 - Math.max(windSpeed - 8, 0) * 2.8), 18, 96);
}

function calculateTravelIndex({
  comfortScore,
  warmthScore,
  airScore,
  drynessScore,
  calmScore,
}) {
  const weighted =
    comfortScore * 0.37 +
    warmthScore * 0.18 +
    airScore * 0.21 +
    drynessScore * 0.15 +
    calmScore * 0.09;

  return Math.round(weighted);
}

export function buildCompareDestination({
  destination,
  country,
  forecast,
  airQuality,
  index,
}) {
  const current = forecast?.current ?? {};
  const daily = forecast?.daily ?? {};
  const air = airQuality?.current ?? {};
  const comfortScore = calculateComfortScore({
    current,
    daily,
    airQuality: air,
  });
  const warmthScore = calculateWarmthScore(current.temperature_2m);
  const airScore = calculateAirScore(air.us_aqi);
  const drynessScore = calculateDrynessScore(
    daily.precipitation_probability_max?.[0],
    daily.precipitation_sum?.[0],
  );
  const calmScore = calculateCalmScore(current.wind_speed_10m);
  const travelIndex = calculateTravelIndex({
    comfortScore,
    warmthScore,
    airScore,
    drynessScore,
    calmScore,
  });

  const weatherLabel = describeWeatherCode(current.weather_code);
  const aqiSummary = describeAqi(air.us_aqi);

  return {
    ...destination,
    chartKey: `destination_${index + 1}`,
    color: comparePalette[index % comparePalette.length],
    countryName: country?.name?.common ?? destination.country,
    flag: destination.flag || country?.flags?.svg || country?.flags?.png,
    region: country?.region ?? "Destination",
    subregion: country?.subregion ?? null,
    population: country?.population ?? null,
    languages: getLanguageNames(country?.languages),
    currencies: getCurrencyNames(country?.currencies),
    capital: country?.capital?.[0] ?? destination.place,
    timezone: forecast?.timezone_abbreviation || forecast?.timezone || null,
    current,
    daily,
    airQuality: air,
    comfortScore,
    warmthScore,
    airScore,
    drynessScore,
    calmScore,
    travelIndex,
    weatherLabel,
    aqiSummary,
    currentTemp: current.temperature_2m ?? null,
    feelsLike: current.apparent_temperature ?? null,
    humidity: current.relative_humidity_2m ?? null,
    windSpeed: current.wind_speed_10m ?? null,
    rainChance: daily.precipitation_probability_max?.[0] ?? null,
    precipitation: daily.precipitation_sum?.[0] ?? null,
    todayHigh: daily.temperature_2m_max?.[0] ?? null,
    todayLow: daily.temperature_2m_min?.[0] ?? null,
    readiness:
      travelIndex >= 82
        ? "Strong all-around signal for an easy travel window."
        : travelIndex >= 68
          ? "Balanced enough for planning, with a few conditions to watch."
          : "More selective conditions right now, especially for outdoor-heavy plans.",
  };
}

function average(values) {
  const filtered = values.filter((value) => value != null && !Number.isNaN(value));

  if (!filtered.length) {
    return null;
  }

  return Math.round(
    filtered.reduce((total, value) => total + value, 0) / filtered.length,
  );
}

function getLeader(destinations, selector, direction = "max") {
  if (!destinations.length) {
    return null;
  }

  return destinations.reduce((best, candidate) => {
    const bestValue = selector(best);
    const candidateValue = selector(candidate);

    if (candidateValue == null || Number.isNaN(candidateValue)) {
      return best;
    }

    if (bestValue == null || Number.isNaN(bestValue)) {
      return candidate;
    }

    if (direction === "min") {
      return candidateValue < bestValue ? candidate : best;
    }

    return candidateValue > bestValue ? candidate : best;
  });
}

export function buildCompareOverview(destinations) {
  if (!destinations.length) {
    return null;
  }

  return {
    averageComfort: average(destinations.map((item) => item.comfortScore)),
    averageTravelIndex: average(destinations.map((item) => item.travelIndex)),
    overallLeader: getLeader(destinations, (item) => item.travelIndex),
    warmestLeader: getLeader(destinations, (item) => item.currentTemp),
    cleanestLeader: getLeader(destinations, (item) => item.airScore),
    driestLeader: getLeader(destinations, (item) => item.drynessScore),
  };
}

export function buildCompareForecastData(destinations) {
  const maxDays = Math.max(
    0,
    ...destinations.map((item) => item.daily?.time?.length ?? 0),
  );

  return Array.from({ length: maxDays }, (_, index) => {
    const seedDate = destinations.find((item) => item.daily?.time?.[index])?.daily?.time?.[index];

    const row = {
      label: seedDate
        ? new Date(seedDate).toLocaleDateString("en-US", {
            weekday: "short",
          })
        : `Day ${index + 1}`,
    };

    destinations.forEach((destination) => {
      const high = destination.daily?.temperature_2m_max?.[index];
      const low = destination.daily?.temperature_2m_min?.[index];

      row[destination.chartKey] =
        high != null && low != null ? (high + low) / 2 : high ?? low ?? null;
    });

    return row;
  });
}

export function buildCompareRadarData(destinations) {
  const metrics = [
    ["Comfort", "comfortScore"],
    ["Warmth", "warmthScore"],
    ["Air", "airScore"],
    ["Dry week", "drynessScore"],
    ["Calm wind", "calmScore"],
  ];

  return metrics.map(([label, key]) => {
    const row = { metric: label };

    destinations.forEach((destination) => {
      row[destination.chartKey] = destination[key];
    });

    return row;
  });
}

export function buildCompareRecommendations(destinations) {
  if (!destinations.length) {
    return [];
  }

  const overall = getLeader(destinations, (item) => item.travelIndex);
  const warmest = getLeader(destinations, (item) => item.currentTemp);
  const cleanest = getLeader(destinations, (item) => item.airScore);
  const driest = getLeader(destinations, (item) => item.drynessScore);

  return [
    {
      label: "Best overall window",
      winner: overall,
      stat: overall ? `${overall.travelIndex}/100 travel index` : "Unavailable",
      description: overall
        ? `${overall.place} combines the most balanced comfort, air, and dryness profile on the board.`
        : "No live data available yet.",
    },
    {
      label: "Warmest live reading",
      winner: warmest,
      stat:
        warmest?.currentTemp != null
          ? `${Math.round(warmest.currentTemp)} deg C right now`
          : "Unavailable",
      description: warmest
        ? `${warmest.place} is currently leading the board for heat and immediate warm-weather appeal.`
        : "No live data available yet.",
    },
    {
      label: "Cleanest air signal",
      winner: cleanest,
      stat: cleanest ? cleanest.aqiSummary.label : "Unavailable",
      description: cleanest
        ? `${cleanest.place} is carrying the lightest exposure profile based on the current AQI reading.`
        : "No live data available yet.",
    },
    {
      label: "Lowest rain risk",
      winner: driest,
      stat:
        driest?.rainChance != null
          ? `${Math.round(driest.rainChance)}% rain chance`
          : "Unavailable",
      description: driest
        ? `${driest.place} looks like the cleanest option for a drier planning window right now.`
        : "No live data available yet.",
    },
  ];
}

function formatCompareScore(value) {
  return value == null || Number.isNaN(value) ? null : Math.round(value);
}

export function buildCompareSeasonalityEntries(
  destinations,
  travelWindowPlans,
  selectedMonth,
) {
  return destinations
    .map((destination, index) => {
      const plan = travelWindowPlans[index] ?? null;
      const selectedMonthData =
        plan?.scoredMonths?.find((month) => month.month === selectedMonth) ?? null;

      return {
        ...destination,
        seasonalityPlan: plan,
        selectedMonthData,
        seasonalityAverage: plan?.scoreAverage ?? null,
        recommendedWindow: plan?.recommendedWindow ?? null,
        topMonth: plan?.topMonth ?? null,
      };
    })
    .sort((left, right) => {
      const rightScore = right.selectedMonthData?.score ?? -1;
      const leftScore = left.selectedMonthData?.score ?? -1;

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return (right.travelIndex ?? 0) - (left.travelIndex ?? 0);
    });
}

export function buildCompareSeasonalityChartData(entries) {
  return MONTH_META.map(({ month, label, fullLabel }) => {
    const row = {
      month,
      label,
      fullLabel,
    };

    entries.forEach((entry) => {
      const score =
        entry.seasonalityPlan?.scoredMonths?.find((item) => item.month === month)
          ?.score ?? null;

      row[entry.chartKey] = score;
    });

    return row;
  });
}

export function buildCompareSeasonalityRecommendations(entries) {
  if (!entries.length) {
    return [];
  }

  const bestSelectedMonth = getLeader(
    entries,
    (item) => item.selectedMonthData?.score,
  );
  const bestAllYear = getLeader(entries, (item) => item.seasonalityAverage);
  const warmestSelectedMonth = getLeader(
    entries,
    (item) => item.selectedMonthData?.temperatureMean,
  );
  const driestSelectedMonth = getLeader(
    entries,
    (item) => item.selectedMonthData?.precipitationTotal,
    "min",
  );
  const bestRecommendedWindow = getLeader(
    entries,
    (item) => item.recommendedWindow?.score,
  );

  return [
    {
      label: "Best this month",
      winner: bestSelectedMonth,
      stat: bestSelectedMonth?.selectedMonthData
        ? `${formatCompareScore(bestSelectedMonth.selectedMonthData.score)}/100 ${bestSelectedMonth.selectedMonthData.band.toLowerCase()}`
        : "Unavailable",
      description: bestSelectedMonth?.selectedMonthData
        ? `${bestSelectedMonth.place} leads the board for the currently selected month and profile.`
        : "No seasonality score is available yet.",
    },
    {
      label: "Best full-season fit",
      winner: bestAllYear,
      stat:
        bestAllYear?.seasonalityAverage != null
          ? `${formatCompareScore(bestAllYear.seasonalityAverage)}/100 seasonal average`
          : "Unavailable",
      description: bestAllYear
        ? `${bestAllYear.place} carries the strongest average score across the full yearly profile.`
        : "No seasonality score is available yet.",
    },
    {
      label: "Warmest selected month",
      winner: warmestSelectedMonth,
      stat:
        warmestSelectedMonth?.selectedMonthData?.temperatureMean != null
          ? `${Math.round(warmestSelectedMonth.selectedMonthData.temperatureMean)} deg C mean`
          : "Unavailable",
      description: warmestSelectedMonth
        ? `${warmestSelectedMonth.place} is the warmest option for the selected month.`
        : "No temperature read is available yet.",
    },
    {
      label: "Driest selected month",
      winner: driestSelectedMonth,
      stat:
        driestSelectedMonth?.selectedMonthData?.precipitationTotal != null
          ? `${Math.round(driestSelectedMonth.selectedMonthData.precipitationTotal)} mm rain`
          : "Unavailable",
      description: driestSelectedMonth
        ? `${driestSelectedMonth.place} has the lowest monthly rainfall load in the current selection.`
        : "No rainfall read is available yet.",
    },
    {
      label: "Best recommended window",
      winner: bestRecommendedWindow,
      stat: bestRecommendedWindow?.recommendedWindow
        ? `${bestRecommendedWindow.recommendedWindow.label} / ${formatCompareScore(bestRecommendedWindow.recommendedWindow.score)}/100`
        : "Unavailable",
      description: bestRecommendedWindow?.recommendedWindow
        ? `${bestRecommendedWindow.place} has the strongest recommended multi-month travel window on the board.`
        : "No recommended window is available yet.",
    },
  ];
}
