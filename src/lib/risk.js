import { buildGeoBounds } from "./geo";

const CATEGORY_WEIGHTS = [
  ["wildfire", 28],
  ["fire", 24],
  ["severe storm", 24],
  ["storm", 20],
  ["flood", 22],
  ["volcano", 24],
  ["landslide", 20],
  ["earthquake", 20],
  ["drought", 16],
  ["dust", 14],
  ["haze", 14],
  ["temperature", 13],
  ["snow", 12],
  ["ice", 10],
  ["water color", 8],
  ["manmade", 10],
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value = "") {
  return value.toLowerCase().trim();
}

function getCategoryWeight(title) {
  const normalized = normalizeText(title);
  const match = CATEGORY_WEIGHTS.find(([label]) => normalized.includes(label));

  return match?.[1] ?? 12;
}

function formatDateLabel(value) {
  if (!value) {
    return "Unavailable";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRiskBand(score) {
  if (score >= 76) {
    return "Severe";
  }

  if (score >= 56) {
    return "Active";
  }

  if (score >= 32) {
    return "Elevated";
  }

  return "Quiet";
}

function getRiskHeadline(band, openCount) {
  if (!openCount) {
    return "No active event signals nearby.";
  }

  if (band === "Severe") {
    return "Multiple high-friction live events are active nearby.";
  }

  if (band === "Active") {
    return "The area has meaningful live event activity to watch.";
  }

  if (band === "Elevated") {
    return "There are some live regional events worth checking before planning.";
  }

  return "Nearby live events look limited right now.";
}

function getRiskTone(band) {
  if (band === "Severe") {
    return "High caution";
  }

  if (band === "Active") {
    return "Watch closely";
  }

  if (band === "Elevated") {
    return "Review before booking";
  }

  return "Low current friction";
}

function getTopCategory(events) {
  const categories = events.flatMap((event) => event.categories ?? []);

  if (!categories.length) {
    return null;
  }

  const counts = categories.reduce((map, category) => {
    const key = category.title || category.id;
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map());

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function getEventSeverity(event) {
  const baseCategoryWeight = Math.max(
    ...(event.categories ?? []).map((category) => getCategoryWeight(category.title)),
    10,
  );
  const magnitudeBonus = event.magnitude?.value
    ? Math.min(event.magnitude.value * 1.4, 18)
    : 0;

  return clamp(baseCategoryWeight + magnitudeBonus, 8, 42);
}

export function buildRiskBbox(lat, lng, { latRadius = 5, lngRadius = 7 } = {}) {
  const minLat = clamp(lat - latRadius, -90, 90);
  const maxLat = clamp(lat + latRadius, -90, 90);
  const minLng = clamp(lng - lngRadius, -180, 180);
  const maxLng = clamp(lng + lngRadius, -180, 180);

  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

export function buildRiskBboxFromPoints(points) {
  const bounds = buildGeoBounds(points, {
    minLatRange: 12,
    minLngRange: 18,
    paddingLat: 6,
    paddingLng: 8,
  });

  return `${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}`;
}

export function buildRiskSnapshot(riskData, { days = 30, scopeLabel = "this area" } = {}) {
  if (!riskData) {
    return {
      score: null,
      band: "Quiet",
      headline: "No live risk signal available yet.",
      tone: "Unavailable",
      openCount: 0,
      total: 0,
      latestEventDate: null,
      latestEventLabel: "Unavailable",
      topCategory: null,
      topEvents: [],
      days,
      scopeLabel,
    };
  }

  const events = [...(riskData.events ?? [])].sort((left, right) => {
    const severityDifference = getEventSeverity(right) - getEventSeverity(left);

    if (severityDifference !== 0) {
      return severityDifference;
    }

    return (right.latestDate || "").localeCompare(left.latestDate || "");
  });

  const severityTotal = events.reduce((total, event) => total + getEventSeverity(event), 0);
  const score = clamp(
    Math.round((riskData.openCount ?? 0) * 12 + severityTotal * 0.65),
    0,
    95,
  );
  const band = getRiskBand(score);
  const topEvents = events.slice(0, 4).map((event) => ({
    ...event,
    severity: getEventSeverity(event),
  }));
  const latestEventLabel = formatDateLabel(riskData.latestEventDate);
  const topCategory = getTopCategory(events);

  return {
    score,
    band,
    headline: getRiskHeadline(band, riskData.openCount ?? 0),
    tone: getRiskTone(band),
    openCount: riskData.openCount ?? 0,
    total: riskData.total ?? 0,
    latestEventDate: riskData.latestEventDate ?? null,
    latestEventLabel,
    topCategory,
    topEvents,
    days,
    scopeLabel,
  };
}
