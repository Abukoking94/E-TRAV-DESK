import { z } from "zod";

const eonetCategorySchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    title: z.string().optional(),
  })
  .passthrough();

const eonetSourceSchema = z
  .object({
    id: z.string(),
    url: z.string().optional(),
  })
  .passthrough();

const eonetFeatureSchema = z
  .object({
    id: z.string().optional(),
    type: z.string().optional(),
    geometry: z
      .object({
        type: z.string(),
        coordinates: z.unknown(),
      })
      .nullable()
      .optional(),
    properties: z
      .object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string().nullable().optional(),
        link: z.string().optional(),
        closed: z.string().nullable().optional(),
        date: z.string().optional(),
        geometryDates: z.array(z.string()).optional().default([]),
        magnitudeValue: z.union([z.number(), z.string()]).nullable().optional(),
        magnitudeUnit: z.string().nullable().optional(),
        magnitudeDescription: z.string().nullable().optional(),
        categories: z.array(eonetCategorySchema).optional().default([]),
        sources: z.array(eonetSourceSchema).optional().default([]),
      })
      .passthrough(),
  })
  .passthrough();

export const riskCollectionSchema = z
  .object({
    type: z.string().optional(),
    features: z.array(eonetFeatureSchema).optional().default([]),
  })
  .passthrough();
