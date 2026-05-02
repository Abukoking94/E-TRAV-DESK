export const WORLD_BOUNDS = {
  minLat: -58,
  maxLat: 82,
  minLng: -180,
  maxLng: 180,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isValidPoint(point) {
  return (
    point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

export function buildGeoBounds(
  points,
  {
    minLatRange = 18,
    minLngRange = 28,
    paddingLat = 8,
    paddingLng = 12,
  } = {},
) {
  const validPoints = points.filter(isValidPoint);

  if (!validPoints.length) {
    return WORLD_BOUNDS;
  }

  const lats = validPoints.map((point) => point.lat);
  const lngs = validPoints.map((point) => point.lng);

  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);

  const latRange = Math.max(maxLat - minLat, minLatRange);
  const lngRange = Math.max(maxLng - minLng, minLngRange);
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  minLat = centerLat - latRange / 2 - paddingLat;
  maxLat = centerLat + latRange / 2 + paddingLat;
  minLng = centerLng - lngRange / 2 - paddingLng;
  maxLng = centerLng + lngRange / 2 + paddingLng;

  const adjustedMinLat = clamp(minLat, WORLD_BOUNDS.minLat, WORLD_BOUNDS.maxLat);
  const adjustedMaxLat = clamp(maxLat, WORLD_BOUNDS.minLat, WORLD_BOUNDS.maxLat);
  const adjustedMinLng = clamp(minLng, WORLD_BOUNDS.minLng, WORLD_BOUNDS.maxLng);
  const adjustedMaxLng = clamp(maxLng, WORLD_BOUNDS.minLng, WORLD_BOUNDS.maxLng);

  return {
    minLat: adjustedMinLat,
    maxLat: adjustedMaxLat,
    minLng: adjustedMinLng,
    maxLng: adjustedMaxLng,
  };
}

export function projectGeoPoint(
  lat,
  lng,
  {
    width = 1000,
    height = 560,
    padding = 30,
    bounds = WORLD_BOUNDS,
  } = {},
) {
  const safeLngRange = Math.max(bounds.maxLng - bounds.minLng, 1);
  const safeLatRange = Math.max(bounds.maxLat - bounds.minLat, 1);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const x = padding + ((lng - bounds.minLng) / safeLngRange) * innerWidth;
  const y =
    padding + (1 - (lat - bounds.minLat) / safeLatRange) * innerHeight;

  return { x, y };
}

export function buildGeoConnectionPath(from, to, curvature = 0.18) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const curveLift = Math.max(distance * curvature, 24);
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2 - curveLift;

  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

export function calculateGeoCentroid(points) {
  const validPoints = points.filter(isValidPoint);

  if (!validPoints.length) {
    return null;
  }

  const totals = validPoints.reduce(
    (accumulator, point) => ({
      lat: accumulator.lat + point.lat,
      lng: accumulator.lng + point.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: totals.lat / validPoints.length,
    lng: totals.lng / validPoints.length,
  };
}
