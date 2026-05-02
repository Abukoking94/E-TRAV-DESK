import {
  DEFAULT_RAINY_DAY_THRESHOLD_MM,
  MONTH_META,
  getMonthMeta,
} from "../../lib/seasonality";

const SIGNAL_KEYS = {
  temperatureMean: "temperature_2m_mean",
  temperatureMax: "temperature_2m_max",
  temperatureMin: "temperature_2m_min",
  precipitationSum: "precipitation_sum",
  rainSum: "rain_sum",
  windSpeedMean: "wind_speed_10m_mean",
  windSpeedMax: "wind_speed_10m_max",
  shortwaveRadiationSum: "shortwave_radiation_sum",
  cloudCoverMean: "cloud_cover_mean",
  relativeHumidityMean: "relative_humidity_2m_mean",
};

function readDailyValue(daily, key, index) {
  const values = daily?.[key];

  if (!Array.isArray(values)) {
    return null;
  }

  return values[index] ?? null;
}

function mapDailySignals(payload) {
  const time = payload.daily?.time ?? [];

  return time.map((date, index) => ({
    date,
    year: Number.parseInt(date.slice(0, 4), 10) || null,
    month: Number.parseInt(date.slice(5, 7), 10) || null,
    day: Number.parseInt(date.slice(8, 10), 10) || null,
    monthKey: date.slice(0, 7),
    temperatureMean: readDailyValue(payload.daily, SIGNAL_KEYS.temperatureMean, index),
    temperatureMax: readDailyValue(payload.daily, SIGNAL_KEYS.temperatureMax, index),
    temperatureMin: readDailyValue(payload.daily, SIGNAL_KEYS.temperatureMin, index),
    precipitationSum: readDailyValue(payload.daily, SIGNAL_KEYS.precipitationSum, index),
    rainSum: readDailyValue(payload.daily, SIGNAL_KEYS.rainSum, index),
    windSpeedMean: readDailyValue(payload.daily, SIGNAL_KEYS.windSpeedMean, index),
    windSpeedMax: readDailyValue(payload.daily, SIGNAL_KEYS.windSpeedMax, index),
    shortwaveRadiationSum: readDailyValue(
      payload.daily,
      SIGNAL_KEYS.shortwaveRadiationSum,
      index,
    ),
    cloudCoverMean: readDailyValue(payload.daily, SIGNAL_KEYS.cloudCoverMean, index),
    relativeHumidityMean: readDailyValue(
      payload.daily,
      SIGNAL_KEYS.relativeHumidityMean,
      index,
    ),
  }));
}

function mapUnits(dailyUnits = {}) {
  return {
    temperatureMean: dailyUnits.temperature_2m_mean ?? null,
    temperatureMax: dailyUnits.temperature_2m_max ?? null,
    temperatureMin: dailyUnits.temperature_2m_min ?? null,
    precipitationSum: dailyUnits.precipitation_sum ?? null,
    rainSum: dailyUnits.rain_sum ?? null,
    windSpeedMean: dailyUnits.wind_speed_10m_mean ?? null,
    windSpeedMax: dailyUnits.wind_speed_10m_max ?? null,
    shortwaveRadiationSum: dailyUnits.shortwave_radiation_sum ?? null,
    cloudCoverMean: dailyUnits.cloud_cover_mean ?? null,
    relativeHumidityMean: dailyUnits.relative_humidity_2m_mean ?? null,
  };
}

function mapSeasonalitySeries(payload, { source, model = null } = {}) {
  const days = mapDailySignals(payload);

  return {
    source,
    model,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    timezone: payload.timezone ?? null,
    timezoneAbbreviation: payload.timezone_abbreviation ?? null,
    utcOffsetSeconds: payload.utc_offset_seconds ?? null,
    elevation: payload.elevation ?? null,
    units: mapUnits(payload.daily_units),
    range: {
      start: days[0]?.date ?? null,
      end: days.at(-1)?.date ?? null,
      totalDays: days.length,
    },
    days,
  };
}

function toFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function average(values, digits = 1) {
  const valid = values.map(toFiniteNumber).filter((value) => value != null);

  if (!valid.length) {
    return null;
  }

  const total = valid.reduce((sum, value) => sum + value, 0);
  return round(total / valid.length, digits);
}

function sum(values, digits = 1) {
  const valid = values.map(toFiniteNumber).filter((value) => value != null);

  if (!valid.length) {
    return null;
  }

  return round(valid.reduce((total, value) => total + value, 0), digits);
}

function round(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function countMatching(values, predicate) {
  return values.reduce((count, value) => {
    const numeric = toFiniteNumber(value);

    if (numeric == null) {
      return count;
    }

    return predicate(numeric) ? count + 1 : count;
  }, 0);
}

function getExtremeMonth(months, metric, comparator) {
  return months
    .filter((month) => month[metric] != null)
    .reduce((best, month) => {
      if (!best) {
        return month;
      }

      return comparator(month[metric], best[metric]) ? month : best;
    }, null);
}

function mapMonthlyRecord(days, rainyDayThreshold) {
  const reference = days[0];
  const monthMeta = getMonthMeta(reference.month);
  const precipitationValues = days.map((day) => day.precipitationSum);
  const rainyDays = countMatching(
    precipitationValues,
    (value) => value >= rainyDayThreshold,
  );
  const validPrecipitationDays = precipitationValues.filter(
    (value) => toFiniteNumber(value) != null,
  ).length;
  const dryDays = countMatching(
    precipitationValues,
    (value) => value < rainyDayThreshold,
  );

  return {
    year: reference.year,
    month: reference.month,
    monthKey: `${reference.year}-${monthMeta.key}`,
    monthLabel: monthMeta.label,
    monthFullLabel: monthMeta.fullLabel,
    sampleDays: days.length,
    validPrecipitationDays,
    rainyDays,
    dryDays,
    rainyDayShare:
      validPrecipitationDays > 0
        ? round((rainyDays / validPrecipitationDays) * 100, 1)
        : null,
    dryDayShare:
      validPrecipitationDays > 0
        ? round((dryDays / validPrecipitationDays) * 100, 1)
        : null,
    temperatureMean: average(days.map((day) => day.temperatureMean)),
    temperatureMax: average(days.map((day) => day.temperatureMax)),
    temperatureMin: average(days.map((day) => day.temperatureMin)),
    precipitationTotal: sum(days.map((day) => day.precipitationSum)),
    rainTotal: sum(days.map((day) => day.rainSum)),
    windSpeedMean: average(days.map((day) => day.windSpeedMean)),
    windSpeedMax: average(days.map((day) => day.windSpeedMax)),
    shortwaveRadiationTotal: sum(days.map((day) => day.shortwaveRadiationSum)),
    cloudCoverMean: average(days.map((day) => day.cloudCoverMean)),
    relativeHumidityMean: average(days.map((day) => day.relativeHumidityMean)),
  };
}

function buildMonthlyRecords(days, rainyDayThreshold) {
  const grouped = new Map();

  days.forEach((day) => {
    if (day.year == null || day.month == null) {
      return;
    }

    const key = `${day.year}-${String(day.month).padStart(2, "0")}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key).push(day);
  });

  return Array.from(grouped.values())
    .map((group) => mapMonthlyRecord(group, rainyDayThreshold))
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey));
}

function buildMonthAggregate(month, monthlyRecords) {
  const monthMeta = getMonthMeta(month);
  const yearsCovered = monthlyRecords
    .map((record) => record.year)
    .filter((value) => value != null)
    .sort((left, right) => left - right);

  return {
    month,
    key: monthMeta.key,
    label: monthMeta.label,
    fullLabel: monthMeta.fullLabel,
    yearsCovered,
    sampleMonths: monthlyRecords.length,
    sampleDays: monthlyRecords.reduce(
      (total, record) => total + (record.sampleDays ?? 0),
      0,
    ),
    rainyDaysAverage: average(monthlyRecords.map((record) => record.rainyDays)),
    dryDaysAverage: average(monthlyRecords.map((record) => record.dryDays)),
    rainyDayShareAverage: average(
      monthlyRecords.map((record) => record.rainyDayShare),
    ),
    dryDayShareAverage: average(
      monthlyRecords.map((record) => record.dryDayShare),
    ),
    temperatureMean: average(
      monthlyRecords.map((record) => record.temperatureMean),
    ),
    temperatureMax: average(monthlyRecords.map((record) => record.temperatureMax)),
    temperatureMin: average(monthlyRecords.map((record) => record.temperatureMin)),
    precipitationTotal: average(
      monthlyRecords.map((record) => record.precipitationTotal),
    ),
    rainTotal: average(monthlyRecords.map((record) => record.rainTotal)),
    windSpeedMean: average(monthlyRecords.map((record) => record.windSpeedMean)),
    windSpeedMax: average(monthlyRecords.map((record) => record.windSpeedMax)),
    shortwaveRadiationTotal: average(
      monthlyRecords.map((record) => record.shortwaveRadiationTotal),
    ),
    cloudCoverMean: average(monthlyRecords.map((record) => record.cloudCoverMean)),
    relativeHumidityMean: average(
      monthlyRecords.map((record) => record.relativeHumidityMean),
    ),
    recordRange:
      monthlyRecords.length > 0
        ? {
            start: monthlyRecords[0].monthKey,
            end: monthlyRecords.at(-1)?.monthKey ?? monthlyRecords[0].monthKey,
          }
        : {
            start: null,
            end: null,
          },
  };
}

function buildMonthlyAggregates(monthlyRecords) {
  return MONTH_META.map(({ month }) => {
    const records = monthlyRecords.filter((record) => record.month === month);
    return buildMonthAggregate(month, records);
  });
}

function buildSeasonalityOverview(months) {
  const warmestMonth = getExtremeMonth(
    months,
    "temperatureMean",
    (next, current) => next > current,
  );
  const coolestMonth = getExtremeMonth(
    months,
    "temperatureMean",
    (next, current) => next < current,
  );
  const driestMonth = getExtremeMonth(
    months,
    "precipitationTotal",
    (next, current) => next < current,
  );
  const wettestMonth = getExtremeMonth(
    months,
    "precipitationTotal",
    (next, current) => next > current,
  );
  const sunniestMonth = getExtremeMonth(
    months,
    "shortwaveRadiationTotal",
    (next, current) => next > current,
  );
  const calmestMonth = getExtremeMonth(
    months,
    "windSpeedMean",
    (next, current) => next < current,
  );

  return {
    warmestMonth: warmestMonth?.label ?? null,
    coolestMonth: coolestMonth?.label ?? null,
    driestMonth: driestMonth?.label ?? null,
    wettestMonth: wettestMonth?.label ?? null,
    sunniestMonth: sunniestMonth?.label ?? null,
    calmestMonth: calmestMonth?.label ?? null,
  };
}

export function buildMonthlySeasonalityProfile(
  series,
  {
    rainyDayThreshold = DEFAULT_RAINY_DAY_THRESHOLD_MM,
  } = {},
) {
  const monthlyRecords = buildMonthlyRecords(series.days ?? [], rainyDayThreshold);
  const months = buildMonthlyAggregates(monthlyRecords);
  const yearsCovered = Array.from(
    new Set(
      monthlyRecords
        .map((record) => record.year)
        .filter((value) => value != null),
    ),
  ).sort((left, right) => left - right);

  return {
    ...series,
    coverage: {
      yearsCovered,
      totalYears: yearsCovered.length,
      totalMonthRecords: monthlyRecords.length,
      completeMonthCoverage: months.filter((month) => month.sampleMonths > 0).length,
      rainyDayThreshold,
    },
    monthlyRecords,
    months,
    overview: buildSeasonalityOverview(months),
  };
}

export function mapHistoricalWeatherSeries(payload) {
  return mapSeasonalitySeries(payload, { source: "historical" });
}

export function mapClimateProjectionSeries(payload, { model = null } = {}) {
  return mapSeasonalitySeries(payload, {
    source: "climate",
    model: model ?? payload.model ?? null,
  });
}

export function mapHistoricalSeasonalityProfile(payload, options) {
  return buildMonthlySeasonalityProfile(
    mapHistoricalWeatherSeries(payload),
    options,
  );
}

export function mapClimateProjectionProfile(payload, options = {}) {
  return buildMonthlySeasonalityProfile(
    mapClimateProjectionSeries(payload, options),
    options,
  );
}
