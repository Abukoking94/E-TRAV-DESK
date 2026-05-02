import { z } from "zod";

export const geocodingSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        country: z.string().optional(),
        country_code: z.string().optional(),
        admin1: z.string().optional(),
      }),
    )
    .optional(),
});

export const forecastSchema = z.object({
  timezone: z.string().optional(),
  timezone_abbreviation: z.string().optional(),
  current: z.object({
    temperature_2m: z.number().nullable().optional(),
    relative_humidity_2m: z.number().nullable().optional(),
    apparent_temperature: z.number().nullable().optional(),
    is_day: z.number().nullable().optional(),
    precipitation: z.number().nullable().optional(),
    wind_speed_10m: z.number().nullable().optional(),
    weather_code: z.number().nullable().optional(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number().nullable()),
    temperature_2m_min: z.array(z.number().nullable()),
    apparent_temperature_max: z.array(z.number().nullable()),
    apparent_temperature_min: z.array(z.number().nullable()),
    precipitation_sum: z.array(z.number().nullable()),
    precipitation_probability_max: z.array(z.number().nullable()),
    weather_code: z.array(z.number().nullable()),
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
    sunshine_duration: z.array(z.number().nullable()),
    wind_speed_10m_max: z.array(z.number().nullable()),
  }),
});

export const airQualitySchema = z.object({
  current: z.object({
    us_aqi: z.number().nullable().optional(),
    pm10: z.number().nullable().optional(),
    pm2_5: z.number().nullable().optional(),
  }),
});

export const marineSchema = z.object({
  current: z
    .object({
      wave_height: z.number().nullable().optional(),
      wave_direction: z.number().nullable().optional(),
      wave_period: z.number().nullable().optional(),
    })
    .optional(),
});
