import { z } from "zod";

export const articleSchema = z.object({
  title: z.string(),
  extract: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z
    .object({
      source: z.string(),
    })
    .optional(),
});

