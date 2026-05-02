import { z } from "zod";

const nullableNumberArray = z.array(z.number().nullable()).optional();

const seasonalityDailySchema = z
  .object({
    time: z.array(z.string()),
    temperature_2m_mean: nullableNumberArray,
    temperature_2m_max: nullableNumberArray,
    temperature_2m_min: nullableNumberArray,
    precipitation_sum: nullableNumberArray,
    rain_sum: nullableNumberArray,
    wind_speed_10m_mean: nullableNumberArray,
    wind_speed_10m_max: nullableNumberArray,
    shortwave_radiation_sum: nullableNumberArray,
    cloud_cover_mean: nullableNumberArray,
    relative_humidity_2m_mean: nullableNumberArray,
  })
  .passthrough();

const openMeteoSeasonalitySchema = z
  .object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    generationtime_ms: z.number().optional(),
    utc_offset_seconds: z.number().optional(),
    timezone: z.string().optional(),
    timezone_abbreviation: z.string().optional(),
    elevation: z.number().optional(),
    daily_units: z.record(z.string().nullable()).optional().default({}),
    daily: seasonalityDailySchema,
  })
  .passthrough();

export const historicalWeatherSchema = openMeteoSeasonalitySchema;

export const climateProjectionSchema = openMeteoSeasonalitySchema.extend({
  model: z.string().optional(),
});
