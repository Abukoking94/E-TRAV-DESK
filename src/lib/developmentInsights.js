function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function average(values) {
  const valid = values.filter((value) => value != null && Number.isFinite(value));

  if (!valid.length) {
    return null;
  }

  return valid.reduce((total, value) => total + value, 0) / valid.length;
}

function normalizePercent(value) {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  return clamp(value);
}

function normalizeLog(value, minLog, maxLog) {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  const normalized =
    ((Math.log10(value) - minLog) / (maxLog - minLog)) * 100;

  return clamp(normalized);
}

function describeBand(score, high, medium) {
  if (score == null) {
    return "Insufficient data";
  }

  if (score >= high) {
    return "Strong";
  }

  if (score >= medium) {
    return "Balanced";
  }

  return "Emerging";
}

export function buildDevelopmentProfile(indicators) {
  if (!indicators) {
    return null;
  }

  const digitalScore = average([
    normalizePercent(indicators.internetUsers?.value),
    normalizePercent(indicators.electricityAccess?.value),
  ]);

  const connectivityScore = average([
    normalizeLog(indicators.airPassengers?.value, 4.5, 7.8),
    normalizeLog(indicators.tourismArrivals?.value, 4.2, 7.6),
  ]);

  const tourismScore = average([
    normalizeLog(indicators.tourismArrivals?.value, 4.2, 7.6),
    normalizePercent(indicators.tourismReceiptsShare?.value),
  ]);

  const prosperityScore = normalizeLog(
    indicators.gdpPerCapita?.value,
    2.8,
    4.9,
  );

  const readinessScore = average([
    digitalScore != null ? digitalScore * 0.34 : null,
    connectivityScore != null ? connectivityScore * 0.28 : null,
    tourismScore != null ? tourismScore * 0.22 : null,
    prosperityScore != null ? prosperityScore * 0.16 : null,
  ]);

  const availableYears = Object.values(indicators)
    .map((item) => Number.parseInt(item?.year, 10))
    .filter(Number.isFinite)
    .sort((left, right) => right - left);

  const freshnessLabel = availableYears.length
    ? availableYears[0] === availableYears[availableYears.length - 1]
      ? `Latest available year ${availableYears[0]}`
      : `Latest available data ranges from ${availableYears[availableYears.length - 1]} to ${availableYears[0]}`
    : "Latest available year unavailable";

  let narrative =
    "The broader operating environment looks steady enough for travel discovery, but still mixed across infrastructure and visitor demand.";

  if ((readinessScore ?? 0) >= 76) {
    narrative =
      "The broader operating environment suggests a mature visitor corridor with strong digital access and dependable arrival capacity.";
  } else if ((readinessScore ?? 0) < 56) {
    narrative =
      "This destination reads as more emerging in the World Bank layer, with a lighter support base for seamless visitor movement.";
  }

  return {
    readinessScore: readinessScore == null ? null : Math.round(readinessScore),
    digitalScore: digitalScore == null ? null : Math.round(digitalScore),
    connectivityScore:
      connectivityScore == null ? null : Math.round(connectivityScore),
    tourismScore: tourismScore == null ? null : Math.round(tourismScore),
    prosperityScore:
      prosperityScore == null ? null : Math.round(prosperityScore),
    digitalBand: describeBand(digitalScore, 78, 58),
    connectivityBand: describeBand(connectivityScore, 72, 48),
    tourismBand: describeBand(tourismScore, 70, 44),
    prosperityBand: describeBand(prosperityScore, 72, 50),
    freshnessLabel,
    narrative,
  };
}
