import { fetchJson } from "./fetchJson";
import { worldBankSeriesSchema } from "../schemas/worldBank.schema";

export const worldBankIndicators = {
  gdpPerCapita: {
    code: "NY.GDP.PCAP.CD",
    label: "GDP per capita",
    unit: "currency",
    description: "Current US$",
  },
  internetUsers: {
    code: "IT.NET.USER.ZS",
    label: "Internet adoption",
    unit: "percent",
    description: "% of population",
  },
  electricityAccess: {
    code: "EG.ELC.ACCS.ZS",
    label: "Electricity access",
    unit: "percent",
    description: "% of population",
  },
  airPassengers: {
    code: "IS.AIR.PSGR",
    label: "Air passengers",
    unit: "count",
    description: "Passengers carried",
  },
  tourismArrivals: {
    code: "ST.INT.ARVL",
    label: "Tourism arrivals",
    unit: "count",
    description: "International arrivals",
  },
  tourismReceiptsShare: {
    code: "ST.INT.RCPT.XP.ZS",
    label: "Tourism receipts share",
    unit: "percent",
    description: "% of total exports",
  },
};

function buildIndicatorUrl(countryCode, indicatorCode) {
  return `https://api.worldbank.org/v2/country/${countryCode.toUpperCase()}/indicator/${indicatorCode}?format=json&per_page=70`;
}

function normalizeValue(value) {
  if (value == null || value === "") {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);

  return Number.isFinite(numeric) ? numeric : null;
}

function pickLatestRecord(records) {
  return records.find((record) => normalizeValue(record.value) != null) ?? null;
}

async function getIndicatorSeries(countryCode, indicator) {
  const json = await fetchJson(buildIndicatorUrl(countryCode, indicator.code));
  const records = worldBankSeriesSchema.parse(json);
  const latest = pickLatestRecord(records);

  return {
    ...indicator,
    value: latest ? normalizeValue(latest.value) : null,
    year: latest?.date ?? null,
  };
}

export async function getCountryDevelopmentIndicators(countryCode) {
  const entries = Object.entries(worldBankIndicators);
  const settled = await Promise.allSettled(
    entries.map(([key, indicator]) => getIndicatorSeries(countryCode, indicator).then((value) => [key, value])),
  );

  const successful = settled.filter((result) => result.status === "fulfilled");

  if (!successful.length) {
    throw new Error("World Bank indicators are unavailable for this destination.");
  }

  return Object.fromEntries(
    settled.map((result, index) => {
      const [key, indicator] = entries[index];

      if (result.status === "fulfilled") {
        return result.value;
      }

      return [
        key,
        {
          ...indicator,
          value: null,
          year: null,
        },
      ];
    }),
  );
}
