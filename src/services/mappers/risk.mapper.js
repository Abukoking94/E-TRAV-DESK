function normalizeMagnitudeValue(value) {
  if (value == null || value === "") {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);

  return Number.isFinite(numeric) ? numeric : null;
}

function flattenCoordinates(input, points = []) {
  if (!Array.isArray(input)) {
    return points;
  }

  if (
    input.length >= 2 &&
    typeof input[0] === "number" &&
    typeof input[1] === "number"
  ) {
    points.push({
      lng: input[0],
      lat: input[1],
    });
    return points;
  }

  input.forEach((item) => flattenCoordinates(item, points));
  return points;
}

function getGeometryCenter(geometry) {
  const points = flattenCoordinates(geometry?.coordinates);

  if (!points.length) {
    return {
      lat: null,
      lng: null,
    };
  }

  const lat =
    points.reduce((total, point) => total + point.lat, 0) / points.length;
  const lng =
    points.reduce((total, point) => total + point.lng, 0) / points.length;

  return {
    lat,
    lng,
  };
}

function getLatestGeometryDate(properties) {
  if (properties.geometryDates?.length) {
    return properties.geometryDates.at(-1);
  }

  return properties.date ?? null;
}

export function mapRiskEvents(collection) {
  const events = (collection.features ?? []).map((feature) => {
    const properties = feature.properties ?? {};
    const center = getGeometryCenter(feature.geometry);

    return {
      id: feature.id ?? properties.id ?? properties.title,
      title: properties.title,
      description: properties.description ?? "",
      link: properties.link ?? null,
      status: properties.closed ? "closed" : "open",
      closedAt: properties.closed ?? null,
      date: properties.date ?? null,
      latestDate: getLatestGeometryDate(properties),
      geometryType: feature.geometry?.type ?? null,
      center,
      categories: (properties.categories ?? []).map((category) => ({
        id: String(category.id),
        title: category.title ?? String(category.id),
      })),
      sources: (properties.sources ?? []).map((source) => ({
        id: source.id,
        url: source.url ?? null,
      })),
      magnitude: {
        value: normalizeMagnitudeValue(properties.magnitudeValue),
        unit: properties.magnitudeUnit ?? null,
        description: properties.magnitudeDescription ?? null,
      },
    };
  });

  const openCount = events.filter((event) => event.status === "open").length;
  const closedCount = events.length - openCount;
  const categoryIds = Array.from(
    new Set(events.flatMap((event) => event.categories.map((category) => category.id))),
  );

  return {
    total: events.length,
    openCount,
    closedCount,
    latestEventDate:
      events
        .map((event) => event.latestDate)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
    categoryIds,
    events,
  };
}
