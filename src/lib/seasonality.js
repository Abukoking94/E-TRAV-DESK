export const MONTH_META = [
  { month: 1, key: "01", label: "Jan", fullLabel: "January" },
  { month: 2, key: "02", label: "Feb", fullLabel: "February" },
  { month: 3, key: "03", label: "Mar", fullLabel: "March" },
  { month: 4, key: "04", label: "Apr", fullLabel: "April" },
  { month: 5, key: "05", label: "May", fullLabel: "May" },
  { month: 6, key: "06", label: "Jun", fullLabel: "June" },
  { month: 7, key: "07", label: "Jul", fullLabel: "July" },
  { month: 8, key: "08", label: "Aug", fullLabel: "August" },
  { month: 9, key: "09", label: "Sep", fullLabel: "September" },
  { month: 10, key: "10", label: "Oct", fullLabel: "October" },
  { month: 11, key: "11", label: "Nov", fullLabel: "November" },
  { month: 12, key: "12", label: "Dec", fullLabel: "December" },
];

export const DEFAULT_SEASONALITY_YEARS = 8;
export const DEFAULT_RAINY_DAY_THRESHOLD_MM = 1;

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function getMonthMeta(month) {
  return (
    MONTH_META.find((entry) => entry.month === month) ?? {
      month,
      key: String(month).padStart(2, "0"),
      label: `M${month}`,
      fullLabel: `Month ${month}`,
    }
  );
}

export function buildSeasonalityDateRange({
  years = DEFAULT_SEASONALITY_YEARS,
  anchorDate = new Date(),
} = {}) {
  const endDate = new Date(
    Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), 0),
  );

  const startDate = new Date(
    Date.UTC(endDate.getUTCFullYear() - years, endDate.getUTCMonth() + 1, 1),
  );

  return {
    years,
    startDate: toIsoDate(startDate),
    endDate: toIsoDate(endDate),
  };
}
