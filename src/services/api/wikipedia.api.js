import { fetchJson } from "./fetchJson";
import { articleSchema } from "../schemas/article.schema";

function normalizeTitle(title) {
  return encodeURIComponent(title.replace(/\s+/g, "_"));
}

export async function getDestinationSummary(title) {
  const json = await fetchJson(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${normalizeTitle(title)}`,
  );
  return articleSchema.parse(json);
}

