export function formatNumber(value) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    notation: value > 99999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatTemp(value) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }

  return `${Math.round(value)} deg C`;
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }

  return `${Math.round(value)}%`;
}

export function formatWind(value) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }

  return `${Math.round(value)} km/h`;
}

export function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toTitle(value = "") {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
