import { calculateGeoCentroid } from "../../lib/geo";
import { MONTH_META } from "../../lib/seasonality";

export const travelSignalMapModeOptions = [
  { value: "selected-month", label: "Selected month heat" },
  { value: "best-window", label: "Best window" },
  { value: "risk-overlay", label: "Risk overlay" },
  { value: "top-month", label: "Top month" },
];

const monthColorPalette = {
  1: "#5ab6ff",
  2: "#4ce4b7",
  3: "#51d48d",
  4: "#80df67",
  5: "#b4e35d",
  6: "#f0dd5b",
  7: "#ffbf5b",
  8: "#ff9966",
  9: "#ff8a7a",
  10: "#c587ff",
  11: "#8f8cff",
  12: "#5d8dff",
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatMonthLabel(month) {
  return MONTH_META.find((item) => item.month === month)?.fullLabel ?? `Month ${month}`;
}

function getScoreColor(score) {
  if (score == null || Number.isNaN(score)) {
    return "rgba(148, 163, 184, 0.55)";
  }

  if (score >= 85) {
    return "#4ce4b7";
  }

  if (score >= 70) {
    return "#2797ff";
  }

  if (score >= 55) {
    return "#6cb6ff";
  }

  if (score >= 40) {
    return "#ffb454";
  }

  return "#ff7a7a";
}

function getRiskColor(riskSnapshot) {
  if (!riskSnapshot) {
    return "rgba(148, 163, 184, 0.55)";
  }

  if (riskSnapshot.band === "Severe") {
    return "#fb7185";
  }

  if (riskSnapshot.band === "Active") {
    return "#f59e0b";
  }

  if (riskSnapshot.band === "Elevated") {
    return "#d9f99d";
  }

  return "#4ce4b7";
}

function getTopMonthColor(topMonth) {
  return monthColorPalette[topMonth?.month] ?? "rgba(148, 163, 184, 0.55)";
}

function getScoreSize(score) {
  if (score == null || Number.isNaN(score)) {
    return 6;
  }

  return clamp(Math.round(7 + score / 16), 7, 13);
}

function getRiskSize(riskSnapshot) {
  if (!riskSnapshot) {
    return 6;
  }

  return clamp(7 + Math.round((riskSnapshot.openCount ?? 0) / 2), 7, 13);
}

function getSecondaryLabel(entry, mapMode, selectedMonthLabel) {
  if (mapMode === "selected-month") {
    return entry.monthData?.score != null
      ? `${Math.round(entry.monthData.score)}/100 in ${selectedMonthLabel}`
      : `No read for ${selectedMonthLabel}`;
  }

  if (mapMode === "best-window") {
    return entry.window?.label
      ? `${entry.window.label} / ${Math.round(entry.window.score ?? 0)}/100`
      : "No recommended window";
  }

  if (mapMode === "risk-overlay") {
    return entry.riskSnapshot
      ? `${entry.riskSnapshot.band} / ${entry.riskSnapshot.openCount} active`
      : "No live risk signal";
  }

  return entry.topMonth?.label
    ? `${entry.topMonth.label} / ${Math.round(entry.topMonth.score ?? 0)}/100`
    : "No leading month";
}

function getDescription(entry, mapMode, selectedMonthLabel) {
  if (mapMode === "selected-month") {
    return entry.monthData?.score != null
      ? `${entry.place} scores ${Math.round(entry.monthData.score)}/100 for ${selectedMonthLabel} on the active travel profile.`
      : `${entry.place} does not yet have a resolved planning score for ${selectedMonthLabel}.`;
  }

  if (mapMode === "best-window") {
    return entry.window?.label
      ? `${entry.place} resolves to a strongest window of ${entry.window.label}.`
      : `${entry.place} does not yet expose a recommended multi-month window.`;
  }

  if (mapMode === "risk-overlay") {
    return (
      entry.riskSnapshot?.headline ||
      `${entry.place} does not currently expose a live risk overlay.`
    );
  }

  return entry.topMonth?.label
    ? `${entry.place} peaks around ${entry.topMonth.label} for the active profile.`
    : `${entry.place} does not yet have a top-month read.`;
}

function getMetaRows(entry, mapMode, selectedMonthLabel) {
  const rows = [
    { label: "Country", value: entry.countryName || "Unavailable" },
  ];

  if (entry.region) {
    rows.push({ label: "Region", value: entry.region });
  }

  if (entry.journeyName) {
    rows.push({ label: "Journey", value: entry.journeyName });
  }

  if (mapMode === "selected-month") {
    rows.push({
      label: selectedMonthLabel,
      value:
        entry.monthData?.score != null
          ? `${Math.round(entry.monthData.score)}/100`
          : "Unavailable",
    });
  }

  if (mapMode === "best-window") {
    rows.push({
      label: "Best window",
      value: entry.window?.label || "Unavailable",
    });
  }

  if (mapMode === "risk-overlay") {
    rows.push({
      label: "Risk",
      value: entry.riskSnapshot
        ? `${entry.riskSnapshot.band} / ${entry.riskSnapshot.openCount}`
        : "Unavailable",
    });
  }

  if (mapMode === "top-month") {
    rows.push({
      label: "Top month",
      value: entry.topMonth?.label || "Unavailable",
    });
  }

  if (entry.note) {
    rows.push({ label: "Note", value: entry.note });
  }

  return rows.slice(0, 4);
}

function buildEntryPoint(entry, mapMode, selectedMonthLabel, rankIndex = 0) {
  const color =
    mapMode === "risk-overlay"
      ? getRiskColor(entry.riskSnapshot)
      : mapMode === "top-month"
        ? getTopMonthColor(entry.topMonth)
        : getScoreColor(
            mapMode === "best-window"
              ? entry.window?.score
              : entry.monthData?.score,
          );
  const size =
    mapMode === "risk-overlay"
      ? getRiskSize(entry.riskSnapshot)
      : getScoreSize(
          mapMode === "best-window"
            ? entry.window?.score
            : mapMode === "top-month"
              ? entry.topMonth?.score
              : entry.monthData?.score,
        );

  return {
    id: entry.id || `${entry.countryCode}:${entry.place}`,
    lat: entry.lat,
    lng: entry.lng,
    label: entry.place,
    secondaryLabel: getSecondaryLabel(entry, mapMode, selectedMonthLabel),
    color,
    size,
    selected: rankIndex === 0,
    keepLabelOnCompact: rankIndex === 0,
    showInLegend: rankIndex < 6,
    legendPriority: Math.max(0, 6 - rankIndex),
    labelOffsetY: rankIndex % 2 === 0 ? -14 : 24,
    description: getDescription(entry, mapMode, selectedMonthLabel),
    metaRows: getMetaRows(entry, mapMode, selectedMonthLabel),
  };
}

export function buildTravelSignalMapModel(
  entries,
  {
    mapMode = "selected-month",
    selectedMonth,
    scopeLabel = "travel desk",
  } = {},
) {
  const selectedMonthLabel = formatMonthLabel(selectedMonth);
  const baseEntries = entries.filter(
    (entry) => Number.isFinite(entry.lat) && Number.isFinite(entry.lng),
  );

  const points = baseEntries.map((entry, index) =>
    buildEntryPoint(entry, mapMode, selectedMonthLabel, index),
  );

  const centroid = calculateGeoCentroid(points);
  const centroidPoint = centroid
    ? {
        id: `${scopeLabel}-centroid`,
        lat: centroid.lat,
        lng: centroid.lng,
        label: "Desk centroid",
        secondaryLabel: `${points.length} mapped nodes`,
        color: "#8edbff",
        size: 7,
        labelOffsetX: 18,
        labelOffsetY: 22,
        showInLegend: false,
        description:
          "A central reference point for the current map mode and active shortlist.",
        metaRows: [
          { label: "Scope", value: scopeLabel },
          { label: "Mapped nodes", value: `${points.length}` },
          {
            label: "Mode",
            value:
              travelSignalMapModeOptions.find((option) => option.value === mapMode)
                ?.label || mapMode,
          },
        ],
      }
    : null;

  const connections = centroidPoint
    ? points.map((point) => ({
        from: point.id,
        to: centroidPoint.id,
        width: point.selected ? 2.4 : 1.8,
        opacity: point.selected ? 0.9 : 0.55,
        dashed: true,
        curvature: 0.12,
        color: point.color,
      }))
    : [];

  return {
    points: centroidPoint ? [...points, centroidPoint] : points,
    connections,
    selectedId: points[0]?.id ?? centroidPoint?.id ?? null,
    selectedMonthLabel,
  };
}
