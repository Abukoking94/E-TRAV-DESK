import {
  getTravelProfile,
  getTravelScoreBand,
  scoreTravelProfileMonths,
} from "./travelProfileScore";

function round(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values, digits = 1) {
  const valid = values.filter((value) => typeof value === "number" && Number.isFinite(value));

  if (!valid.length) {
    return null;
  }

  return round(
    valid.reduce((total, value) => total + value, 0) / valid.length,
    digits,
  );
}

function uniqueBy(items, getKey) {
  const seen = new Set();

  return items.filter((item) => {
    const key = getKey(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getWindowMonths(months, startIndex, size) {
  const selected = [];

  for (let offset = 0; offset < size; offset += 1) {
    const month = months[(startIndex + offset) % months.length];

    if (!month || month.score == null) {
      return null;
    }

    selected.push(month);
  }

  return selected;
}

function buildWindowEntry(months, size) {
  const start = months[0];
  const end = months.at(-1);
  const score = average(months.map((month) => month.score));

  return {
    id: `${start.key}-${size}`,
    size,
    score,
    band: getTravelScoreBand(score),
    startMonth: start.month,
    endMonth: end.month,
    startLabel: start.label,
    endLabel: end.label,
    label:
      size === 1 ? start.fullLabel : `${start.fullLabel} to ${end.fullLabel}`,
    monthKeys: months.map((month) => month.key),
    monthLabels: months.map((month) => month.label),
    months,
    strengths: uniqueBy(
      months.flatMap((month) => month.strengths ?? []),
      (value) => value,
    ).slice(0, 4),
    cautions: uniqueBy(
      months.flatMap((month) => month.cautions ?? []),
      (value) => value,
    ).slice(0, 4),
  };
}

export function rankTravelWindows(
  scoredMonths,
  {
    windowSizes = [1, 2, 3],
    limit = 6,
  } = {},
) {
  const availableMonths = (scoredMonths ?? []).filter((month) => month.score != null);

  if (!availableMonths.length) {
    return [];
  }

  const windows = [];

  windowSizes.forEach((size) => {
    if (size < 1 || size > availableMonths.length) {
      return;
    }

    availableMonths.forEach((_, index) => {
      const windowMonths = getWindowMonths(availableMonths, index, size);

      if (!windowMonths) {
        return;
      }

      windows.push(buildWindowEntry(windowMonths, size));
    });
  });

  return windows
    .sort((left, right) => {
      if (right.score !== left.score) {
        return (right.score ?? -1) - (left.score ?? -1);
      }

      if (right.size !== left.size) {
        return right.size - left.size;
      }

      return left.startMonth - right.startMonth;
    })
    .slice(0, limit);
}

export function buildTravelWindowPlan(
  seasonalityProfile,
  profileId,
  options = {},
) {
  const profile = getTravelProfile(profileId);
  const scored = scoreTravelProfileMonths(seasonalityProfile, profile.id);
  const rankedWindows = rankTravelWindows(scored.months, options);

  return {
    profile,
    scoredMonths: scored.months,
    rankedMonths: scored.rankedMonths,
    topMonth: scored.topMonth,
    scoreAverage: scored.scoreAverage,
    rankedWindows,
    recommendedWindow: rankedWindows[0] ?? null,
    overview: {
      primeMonths: scored.months.filter((month) => month.band === "Prime").length,
      strongMonths: scored.months.filter((month) => month.band === "Strong").length,
      mixedMonths: scored.months.filter((month) => month.band === "Mixed").length,
      avoidMonths: scored.months.filter((month) => month.band === "Avoid").length,
    },
  };
}
