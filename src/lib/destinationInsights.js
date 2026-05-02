import { formatNumber, formatTemp } from "./formatters";

const weatherCodeLabels = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm with hail",
};

const aqiBands = [
  { max: 50, label: "Clean air", tone: "Low risk" },
  { max: 100, label: "Moderate air", tone: "Generally acceptable" },
  { max: 150, label: "Sensitive caution", tone: "May affect sensitive groups" },
  { max: 200, label: "Unhealthy", tone: "Reduced comfort" },
  { max: 300, label: "Very unhealthy", tone: "High exposure risk" },
];

export function describeWeatherCode(code) {
  return weatherCodeLabels[code] || "Variable conditions";
}

export function describeAqi(aqi) {
  if (aqi == null || Number.isNaN(aqi)) {
    return { label: "Unavailable", tone: "No live AQI data" };
  }

  const band = aqiBands.find((item) => aqi <= item.max);
  return band || { label: "Hazardous", tone: "Extreme exposure risk" };
}

export function calculateComfortScore(destination) {
  const temp = destination.current?.temperature_2m ?? 22;
  const feelsLike = destination.current?.apparent_temperature ?? temp;
  const humidity = destination.current?.relative_humidity_2m ?? 50;
  const wind = destination.current?.wind_speed_10m ?? 10;
  const aqi = destination.airQuality?.us_aqi ?? 50;
  const rainChance = destination.daily?.precipitation_probability_max?.[0] ?? 10;

  let score = 100;

  score -= Math.min(Math.abs(feelsLike - 23) * 2.4, 28);
  score -= Math.max(humidity - 65, 0) * 0.35;
  score -= Math.max(wind - 22, 0) * 0.6;
  score -= Math.max(aqi - 50, 0) * 0.18;
  score -= Math.max(rainChance - 30, 0) * 0.25;

  return Math.max(18, Math.min(96, Math.round(score)));
}

export function buildClimateNarrative(destination) {
  const weatherLabel = describeWeatherCode(destination.current?.weather_code);
  const aqiSummary = describeAqi(destination.airQuality?.us_aqi);
  const comfortScore = calculateComfortScore(destination);
  const precipitation = destination.daily?.precipitation_sum?.[0] ?? 0;
  const sunshineDuration = destination.daily?.sunshine_duration?.[0] ?? 0;
  const sunshineHours = sunshineDuration ? Math.round(sunshineDuration / 3600) : 0;

  let readiness = "Balanced conditions for travel-focused exploration.";

  if (comfortScore >= 80) {
    readiness = "This looks like a strong window for comfortable exploration.";
  } else if (comfortScore < 55) {
    readiness = "Conditions look more demanding right now, especially for outdoor-heavy plans.";
  }

  let precipitationNote = "Rain risk is currently light.";
  if (precipitation >= 8) {
    precipitationNote = "Expect a noticeably wetter pattern during the current forecast window.";
  } else if (precipitation >= 3) {
    precipitationNote = "Some scattered rain may shape the week.";
  }

  let sunshineNote = "Sunshine coverage looks moderate.";
  if (sunshineHours >= 8) {
    sunshineNote = "The current forecast points to strong sunshine availability.";
  } else if (sunshineHours <= 3) {
    sunshineNote = "Expect a moodier, lower-sunlight stretch.";
  }

  return {
    comfortScore,
    weatherLabel,
    aqiSummary,
    readiness,
    precipitationNote,
    sunshineNote,
  };
}

export function buildTravelMoodTags(destination) {
  const tags = [];
  const comfortScore = calculateComfortScore(destination);
  const temp = destination.current?.temperature_2m ?? 22;
  const precipitation = destination.daily?.precipitation_sum?.[0] ?? 0;
  const aqi = destination.airQuality?.us_aqi ?? 80;
  const marineHeight = destination.marine?.wave_height ?? null;

  if (comfortScore >= 78) {
    tags.push("Comfort-forward");
  }

  if (temp >= 26) {
    tags.push("Warm escape");
  } else if (temp <= 12) {
    tags.push("Cool-weather");
  }

  if (precipitation <= 2) {
    tags.push("Dry-week");
  } else if (precipitation >= 8) {
    tags.push("Rain-aware");
  }

  if (aqi <= 50) {
    tags.push("Clean-air");
  }

  if (marineHeight != null) {
    tags.push("Coastal signal");
  }

  return tags.slice(0, 4);
}

export function summarizeVisitWindow(destination) {
  const maxTemp = destination.daily?.temperature_2m_max?.[0];
  const minTemp = destination.daily?.temperature_2m_min?.[0];
  const apparentMax = destination.daily?.apparent_temperature_max?.[0];
  const rainChance = destination.daily?.precipitation_probability_max?.[0];

  return `Today leans ${describeWeatherCode(
    destination.current?.weather_code,
  ).toLowerCase()} with highs near ${formatTemp(maxTemp)}, lows around ${formatTemp(
    minTemp,
  )}, and a felt peak close to ${formatTemp(apparentMax)}. Rain probability is ${formatNumber(
    rainChance,
  )}% for the current daily window.`;
}

