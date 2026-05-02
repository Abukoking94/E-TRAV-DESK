import { fetchJson } from "./fetchJson";
import { riskCollectionSchema } from "../schemas/risk.schema";

function joinParam(value) {
  if (Array.isArray(value)) {
    return value.join(",");
  }

  return value;
}

function buildEonetUrl(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, rawValue]) => {
    const value = joinParam(rawValue);

    if (value == null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  return `https://eonet.gsfc.nasa.gov/api/v3/events/geojson?${searchParams.toString()}`;
}

export async function getNearbyEvents({
  bbox,
  category,
  source,
  status = "open",
  days = 30,
  limit = 30,
  start,
  end,
  magId,
  magMin,
  magMax,
} = {}) {
  const json = await fetchJson(
    buildEonetUrl({
      bbox,
      category,
      source,
      status,
      days,
      limit,
      start,
      end,
      magID: magId,
      magMin,
      magMax,
    }),
  );

  return riskCollectionSchema.parse(json);
}
