import { z } from "zod";

export const countrySchema = z.object({
  name: z.object({
    common: z.string(),
    official: z.string().optional(),
  }),
  cca2: z.string(),
  cca3: z.string().optional(),
  capital: z.array(z.string()).optional(),
  capitalInfo: z
    .object({
      latlng: z.array(z.number()).optional(),
    })
    .optional(),
  region: z.string().optional(),
  subregion: z.string().optional(),
  population: z.number().optional(),
  area: z.number().optional(),
  latlng: z.array(z.number()).optional(),
  borders: z.array(z.string()).optional(),
  timezones: z.array(z.string()).optional(),
  continents: z.array(z.string()).optional(),
  languages: z.record(z.string()).optional(),
  currencies: z.record(z.object({ name: z.string().optional() })).optional(),
  flags: z.object({
    png: z.string().optional(),
    svg: z.string().optional(),
    alt: z.string().optional(),
  }),
});

export const countriesSchema = z.array(countrySchema);

