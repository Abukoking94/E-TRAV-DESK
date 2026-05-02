import { z } from "zod";

const worldBankMetaSchema = z.object({
  page: z.number().or(z.string()).optional(),
  pages: z.number().or(z.string()).optional(),
  per_page: z.number().or(z.string()).optional(),
  total: z.number().or(z.string()).optional(),
}).passthrough();

const worldBankRecordSchema = z.object({
  indicator: z
    .object({
      id: z.string().optional(),
      value: z.string().optional(),
    })
    .passthrough()
    .optional(),
  country: z
    .object({
      id: z.string().optional(),
      value: z.string().optional(),
    })
    .passthrough()
    .optional(),
  countryiso3code: z.string().optional(),
  date: z.string(),
  value: z.union([z.number(), z.string()]).nullable(),
  unit: z.string().nullable().optional(),
  obs_status: z.string().nullable().optional(),
  decimal: z.number().or(z.string()).nullable().optional(),
}).passthrough();

export const worldBankSeriesSchema = z
  .tuple([worldBankMetaSchema, z.array(worldBankRecordSchema).optional().default([])])
  .transform(([, records]) => records);
