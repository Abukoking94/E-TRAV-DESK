import { fetchJson } from "./fetchJson";
import {
  airQualitySchema,
  forecastSchema,
  geocodingSchema,
  marineSchema,
} from "../schemas/weather.schema";
import {
  climateProjectionSchema,
  historicalWeatherSchema,
} from "../schemas/seasonality.schema";

export const DEFAULT_HISTORICAL_DAILY_FIELDS = [
  "temperature_2m_mean",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "rain_sum",
  "wind_speed_10m_mean",
  "wind_speed_10m_max",
  "shortwave_radiation_sum",
  "cloud_cover_mean",
  "relative_humidity_2m_mean",
];

export const DEFAULT_CLIMATE_DAILY_FIELDS = [...DEFAULT_HISTORICAL_DAILY_FIELDS];
export const DEFAULT_CLIMATE_MODEL = "EC_Earth3P_HR";

function buildOpenMeteoUrl(baseUrl, params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (!value.length) {
        return;
      }

      searchParams.set(key, value.join(","));
      return;
    }

    searchParams.set(key, String(value));
  });

  return `${baseUrl}?${searchParams.toString()}`;
}

function assertDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error("Historical and climate queries require both startDate and endDate.");
  }
}

export async function searchDestinations(query) {
  const json = await fetchJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query,
    )}&count=8&language=en&format=json`,
  );
  return geocodingSchema.parse(json).results ?? [];
}

export async function getForecast(lat, lng) {
  const json = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,weather_code,sunrise,sunset,sunshine_duration,wind_speed_10m_max&forecast_days=7&timezone=auto`,
  );
  return forecastSchema.parse(json);
}

export async function getAirQuality(lat, lng) {
  const json = await fetchJson(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm10,pm2_5&timezone=auto`,
  );
  return airQualitySchema.parse(json);
}

export async function getMarine(lat, lng) {
  const json = await fetchJson(
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_direction,wave_period&timezone=auto`,
  );
  return marineSchema.parse(json);
}

export async function getHistoricalDailyWeather(
  lat,
  lng,
  {
    startDate,
    endDate,
    timezone = "auto",
    daily = DEFAULT_HISTORICAL_DAILY_FIELDS,
  } = {},
) {
  assertDateRange(startDate, endDate);

  const json = await fetchJson(
    buildOpenMeteoUrl("https://archive-api.open-meteo.com/v1/archive", {
      latitude: lat,
      longitude: lng,
      start_date: startDate,
      end_date: endDate,
      daily,
      timezone,
    }),
  );

  return historicalWeatherSchema.parse(json);
}

export async function getClimateProjection(
  lat,
  lng,
  {
    startDate,
    endDate,
    model = DEFAULT_CLIMATE_MODEL,
    daily = DEFAULT_CLIMATE_DAILY_FIELDS,
  } = {},
) {
  assertDateRange(startDate, endDate);

  const json = await fetchJson(
    buildOpenMeteoUrl("https://climate-api.open-meteo.com/v1/climate", {
      latitude: lat,
      longitude: lng,
      start_date: startDate,
      end_date: endDate,
      models: model,
      daily,
    }),
  );

  return climateProjectionSchema.parse(json);
}
