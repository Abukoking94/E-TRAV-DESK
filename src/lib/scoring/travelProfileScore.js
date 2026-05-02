const PROFILE_DEFINITIONS = [
  {
    id: "warm-dry",
    label: "Warm & Dry",
    shortLabel: "Warm/Dry",
    summary: "Favors heat, low rain, lower humidity, and strong sunshine.",
    metrics: [
      {
        key: "temperatureMean",
        label: "Mean temperature",
        type: "range",
        idealMin: 24,
        idealMax: 29,
        outerMin: 18,
        outerMax: 34,
        weight: 24,
      },
      {
        key: "temperatureMax",
        label: "Daytime high",
        type: "range",
        idealMin: 26,
        idealMax: 32,
        outerMin: 20,
        outerMax: 38,
        weight: 10,
      },
      {
        key: "precipitationTotal",
        label: "Monthly rain",
        type: "low",
        idealMax: 35,
        outerMax: 220,
        weight: 18,
      },
      {
        key: "rainyDayShareAverage",
        label: "Rainy-day share",
        type: "low",
        idealMax: 25,
        outerMax: 75,
        weight: 14,
      },
      {
        key: "windSpeedMean",
        label: "Wind pace",
        type: "low",
        idealMax: 18,
        outerMax: 40,
        weight: 8,
      },
      {
        key: "solarDailyAverage",
        label: "Sun signal",
        type: "high",
        idealMin: 18,
        outerMin: 8,
        weight: 12,
      },
      {
        key: "relativeHumidityMean",
        label: "Humidity balance",
        type: "range",
        idealMin: 40,
        idealMax: 65,
        outerMin: 25,
        outerMax: 85,
        weight: 6,
      },
      {
        key: "cloudCoverMean",
        label: "Cloud cover",
        type: "low",
        idealMax: 35,
        outerMax: 85,
        weight: 8,
      },
    ],
  },
  {
    id: "beach",
    label: "Beach",
    shortLabel: "Beach",
    summary: "Prioritizes warm water-weather, sun, lighter wind, and dry beach days.",
    metrics: [
      {
        key: "temperatureMean",
        label: "Mean temperature",
        type: "range",
        idealMin: 25,
        idealMax: 31,
        outerMin: 20,
        outerMax: 36,
        weight: 24,
      },
      {
        key: "temperatureMin",
        label: "Night warmth",
        type: "range",
        idealMin: 20,
        idealMax: 27,
        outerMin: 14,
        outerMax: 30,
        weight: 10,
      },
      {
        key: "precipitationTotal",
        label: "Monthly rain",
        type: "low",
        idealMax: 25,
        outerMax: 250,
        weight: 16,
      },
      {
        key: "rainyDayShareAverage",
        label: "Rainy-day share",
        type: "low",
        idealMax: 20,
        outerMax: 70,
        weight: 12,
      },
      {
        key: "windSpeedMean",
        label: "Wind pace",
        type: "low",
        idealMax: 16,
        outerMax: 38,
        weight: 10,
      },
      {
        key: "solarDailyAverage",
        label: "Sun signal",
        type: "high",
        idealMin: 19,
        outerMin: 9,
        weight: 16,
      },
      {
        key: "cloudCoverMean",
        label: "Cloud cover",
        type: "low",
        idealMax: 30,
        outerMax: 80,
        weight: 6,
      },
      {
        key: "relativeHumidityMean",
        label: "Humidity balance",
        type: "range",
        idealMin: 45,
        idealMax: 70,
        outerMin: 30,
        outerMax: 90,
        weight: 6,
      },
    ],
  },
  {
    id: "city-break",
    label: "City Break",
    shortLabel: "City",
    summary: "Targets walkable urban weather with moderate temperatures and manageable rain.",
    metrics: [
      {
        key: "temperatureMean",
        label: "Mean temperature",
        type: "range",
        idealMin: 16,
        idealMax: 24,
        outerMin: 8,
        outerMax: 31,
        weight: 24,
      },
      {
        key: "temperatureMax",
        label: "Daytime high",
        type: "range",
        idealMin: 20,
        idealMax: 28,
        outerMin: 12,
        outerMax: 35,
        weight: 8,
      },
      {
        key: "temperatureMin",
        label: "Night comfort",
        type: "range",
        idealMin: 10,
        idealMax: 18,
        outerMin: 2,
        outerMax: 24,
        weight: 10,
      },
      {
        key: "precipitationTotal",
        label: "Monthly rain",
        type: "low",
        idealMax: 45,
        outerMax: 240,
        weight: 14,
      },
      {
        key: "rainyDayShareAverage",
        label: "Rainy-day share",
        type: "low",
        idealMax: 30,
        outerMax: 75,
        weight: 12,
      },
      {
        key: "windSpeedMean",
        label: "Wind pace",
        type: "low",
        idealMax: 20,
        outerMax: 40,
        weight: 10,
      },
      {
        key: "solarDailyAverage",
        label: "Sun signal",
        type: "high",
        idealMin: 14,
        outerMin: 6,
        weight: 8,
      },
      {
        key: "cloudCoverMean",
        label: "Cloud cover",
        type: "low",
        idealMax: 50,
        outerMax: 90,
        weight: 6,
      },
      {
        key: "relativeHumidityMean",
        label: "Humidity balance",
        type: "range",
        idealMin: 35,
        idealMax: 70,
        outerMin: 20,
        outerMax: 90,
        weight: 8,
      },
    ],
  },
  {
    id: "hiking",
    label: "Hiking",
    shortLabel: "Hiking",
    summary: "Rewards mild temperatures, lighter wind, and dry enough trails for active days.",
    metrics: [
      {
        key: "temperatureMean",
        label: "Mean temperature",
        type: "range",
        idealMin: 12,
        idealMax: 22,
        outerMin: 4,
        outerMax: 29,
        weight: 22,
      },
      {
        key: "temperatureMax",
        label: "Daytime high",
        type: "range",
        idealMin: 16,
        idealMax: 26,
        outerMin: 8,
        outerMax: 34,
        weight: 10,
      },
      {
        key: "temperatureMin",
        label: "Morning low",
        type: "range",
        idealMin: 6,
        idealMax: 16,
        outerMin: 0,
        outerMax: 22,
        weight: 14,
      },
      {
        key: "precipitationTotal",
        label: "Monthly rain",
        type: "low",
        idealMax: 60,
        outerMax: 260,
        weight: 14,
      },
      {
        key: "rainyDayShareAverage",
        label: "Rainy-day share",
        type: "low",
        idealMax: 35,
        outerMax: 80,
        weight: 10,
      },
      {
        key: "windSpeedMean",
        label: "Wind pace",
        type: "low",
        idealMax: 22,
        outerMax: 45,
        weight: 12,
      },
      {
        key: "solarDailyAverage",
        label: "Sun signal",
        type: "high",
        idealMin: 13,
        outerMin: 5,
        weight: 8,
      },
      {
        key: "cloudCoverMean",
        label: "Cloud cover",
        type: "low",
        idealMax: 55,
        outerMax: 95,
        weight: 4,
      },
      {
        key: "relativeHumidityMean",
        label: "Humidity balance",
        type: "range",
        idealMin: 35,
        idealMax: 75,
        outerMin: 20,
        outerMax: 95,
        weight: 6,
      },
    ],
  },
  {
    id: "calm-escape",
    label: "Calm Escape",
    shortLabel: "Calm",
    summary: "Pushes toward balanced warmth, lower wind, and low-friction weather.",
    metrics: [
      {
        key: "temperatureMean",
        label: "Mean temperature",
        type: "range",
        idealMin: 18,
        idealMax: 27,
        outerMin: 12,
        outerMax: 33,
        weight: 22,
      },
      {
        key: "temperatureMin",
        label: "Night comfort",
        type: "range",
        idealMin: 14,
        idealMax: 22,
        outerMin: 8,
        outerMax: 26,
        weight: 8,
      },
      {
        key: "precipitationTotal",
        label: "Monthly rain",
        type: "low",
        idealMax: 40,
        outerMax: 220,
        weight: 14,
      },
      {
        key: "rainyDayShareAverage",
        label: "Rainy-day share",
        type: "low",
        idealMax: 25,
        outerMax: 75,
        weight: 12,
      },
      {
        key: "windSpeedMean",
        label: "Wind pace",
        type: "low",
        idealMax: 12,
        outerMax: 32,
        weight: 18,
      },
      {
        key: "solarDailyAverage",
        label: "Sun signal",
        type: "high",
        idealMin: 14,
        outerMin: 6,
        weight: 8,
      },
      {
        key: "cloudCoverMean",
        label: "Cloud cover",
        type: "low",
        idealMax: 45,
        outerMax: 90,
        weight: 8,
      },
      {
        key: "relativeHumidityMean",
        label: "Humidity balance",
        type: "range",
        idealMin: 35,
        idealMax: 65,
        outerMin: 20,
        outerMax: 85,
        weight: 10,
      },
    ],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values, digits = 1) {
  const valid = values.map(normalizeNumber).filter((value) => value != null);

  if (!valid.length) {
    return null;
  }

  return round(
    valid.reduce((total, value) => total + value, 0) / valid.length,
    digits,
  );
}

function scoreRangeMetric(value, rule) {
  if (value == null) {
    return null;
  }

  if (value >= rule.idealMin && value <= rule.idealMax) {
    return 100;
  }

  if (value < rule.outerMin || value > rule.outerMax) {
    return 0;
  }

  if (value < rule.idealMin) {
    return round(
      ((value - rule.outerMin) / (rule.idealMin - rule.outerMin)) * 100,
      1,
    );
  }

  return round(
    ((rule.outerMax - value) / (rule.outerMax - rule.idealMax)) * 100,
    1,
  );
}

function scoreLowMetric(value, rule) {
  if (value == null) {
    return null;
  }

  if (value <= rule.idealMax) {
    return 100;
  }

  if (value >= rule.outerMax) {
    return 0;
  }

  return round(
    ((rule.outerMax - value) / (rule.outerMax - rule.idealMax)) * 100,
    1,
  );
}

function scoreHighMetric(value, rule) {
  if (value == null) {
    return null;
  }

  if (value >= rule.idealMin) {
    return 100;
  }

  if (value <= rule.outerMin) {
    return 0;
  }

  return round(
    ((value - rule.outerMin) / (rule.idealMin - rule.outerMin)) * 100,
    1,
  );
}

function getMetricScore(value, rule) {
  if (rule.type === "range") {
    return scoreRangeMetric(value, rule);
  }

  if (rule.type === "low") {
    return scoreLowMetric(value, rule);
  }

  if (rule.type === "high") {
    return scoreHighMetric(value, rule);
  }

  return null;
}

function getMetricRead(month, key) {
  if (key === "solarDailyAverage") {
    if (!month.sampleMonths || !month.sampleDays || month.shortwaveRadiationTotal == null) {
      return null;
    }

    const averageDays = month.sampleDays / month.sampleMonths;

    if (!Number.isFinite(averageDays) || averageDays <= 0) {
      return null;
    }

    return round(month.shortwaveRadiationTotal / averageDays, 2);
  }

  return normalizeNumber(month[key]);
}

function describeComponentBand(score) {
  if (score == null) {
    return "unavailable";
  }

  if (score >= 85) {
    return "excellent";
  }

  if (score >= 70) {
    return "strong";
  }

  if (score >= 55) {
    return "balanced";
  }

  if (score >= 35) {
    return "fragile";
  }

  return "weak";
}

export function getTravelProfile(profileId) {
  return (
    PROFILE_DEFINITIONS.find((profile) => profile.id === profileId) ??
    PROFILE_DEFINITIONS[0]
  );
}

export const TRAVEL_PROFILE_OPTIONS = PROFILE_DEFINITIONS.map((profile) => ({
  value: profile.id,
  label: profile.label,
  shortLabel: profile.shortLabel,
  summary: profile.summary,
}));

export function getTravelScoreBand(score) {
  if (score == null) {
    return "Unavailable";
  }

  if (score >= 85) {
    return "Prime";
  }

  if (score >= 70) {
    return "Strong";
  }

  if (score >= 55) {
    return "Mixed";
  }

  return "Avoid";
}

export function scoreTravelMonth(month, profileId) {
  const profile = getTravelProfile(profileId);

  if (!month || !month.sampleMonths) {
    return {
      ...month,
      profileId: profile.id,
      profileLabel: profile.label,
      score: null,
      weightedScore: null,
      band: "Unavailable",
      coverageRatio: 0,
      components: [],
      strengths: [],
      cautions: [],
    };
  }

  const components = profile.metrics.map((rule) => {
    const value = getMetricRead(month, rule.key);
    const score = getMetricScore(value, rule);
    const weightedScore = score == null ? null : round((score * rule.weight) / 100, 2);

    return {
      key: rule.key,
      label: rule.label,
      type: rule.type,
      weight: rule.weight,
      value,
      score,
      weightedScore,
      band: describeComponentBand(score),
    };
  });

  const availableWeight = components.reduce((total, component) => {
    if (component.score == null) {
      return total;
    }

    return total + component.weight;
  }, 0);

  const totalWeightedScore = components.reduce((total, component) => {
    if (component.weightedScore == null) {
      return total;
    }

    return total + component.weightedScore;
  }, 0);

  const normalizedScore =
    availableWeight > 0
      ? round((totalWeightedScore / availableWeight) * 100, 1)
      : null;

  const sortedComponents = [...components]
    .filter((component) => component.score != null)
    .sort((left, right) => right.score - left.score);

  return {
    ...month,
    profileId: profile.id,
    profileLabel: profile.label,
    score: normalizedScore,
    weightedScore: totalWeightedScore,
    availableWeight,
    coverageRatio: round(availableWeight / 100, 2),
    band: getTravelScoreBand(normalizedScore),
    components,
    strengths: sortedComponents.slice(0, 3).map((component) => component.label),
    cautions: sortedComponents
      .slice()
      .reverse()
      .slice(0, 3)
      .map((component) => component.label),
  };
}

export function scoreTravelProfileMonths(seasonalityProfile, profileId) {
  const profile = getTravelProfile(profileId);
  const months = (seasonalityProfile?.months ?? []).map((month) =>
    scoreTravelMonth(month, profile.id),
  );

  const rankedMonths = [...months]
    .filter((month) => month.score != null)
    .sort((left, right) => right.score - left.score || left.month - right.month);

  return {
    profile,
    months,
    rankedMonths,
    topMonth: rankedMonths[0] ?? null,
    scoreAverage: average(months.map((month) => month.score)),
  };
}
