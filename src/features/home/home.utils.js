function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildPulseCells(activeCount, seed) {
  return Array.from({ length: 32 }, (_, index) => {
    const normalized = (index * 5 + seed * 3 + Math.floor(index / 4)) % 32;
    return normalized < activeCount;
  });
}

function buildHomePulseStates(metrics) {
  const leadingRegionLabel = metrics.leadingRegion?.label || "Global desk";
  const leadingRegionShare = metrics.leadingRegion?.share || 0;
  const mostConnectedName =
    metrics.mostConnectedCountry?.name?.common || "Lead corridor";
  const mostConnectedBorders = metrics.mostConnectedCountry?.borders?.length || 0;

  return [
    {
      id: "coverage",
      label: "Indexed travel nodes",
      value: metrics.countryCount,
      accent: `${metrics.regionCount} active regional clusters`,
      description: `${leadingRegionLabel} currently leads atlas coverage with a ${leadingRegionShare}% share of indexed destinations.`,
      status: "Coverage synchronized",
      cells: buildPulseCells(clamp(metrics.regionCount * 4 + 6, 10, 24), 1),
    },
    {
      id: "borders",
      label: "Cross-border routes",
      value: metrics.borderLinkCount,
      accent: `${mostConnectedBorders} direct border links around ${mostConnectedName}`,
      description: `${mostConnectedName} is the densest land-route corridor in the current public country layer.`,
      status: "Route graph active",
      cells: buildPulseCells(clamp(Math.round(Math.sqrt(metrics.borderLinkCount || 0) * 1.45), 10, 28), 2),
    },
    {
      id: "languages",
      label: "Languages indexed",
      value: metrics.languageCount,
      accent: `${metrics.currencyCount} currency systems linked`,
      description: "Language and currency diversity power the desk's search, compare, and editorial layers.",
      status: "Diversity layer refreshed",
      cells: buildPulseCells(clamp(Math.round((metrics.languageCount || 0) / 3), 10, 26), 3),
    },
    {
      id: "population",
      label: "Population scope",
      value: metrics.totalPopulation,
      accent: `${metrics.countryCount} territories inside scope`,
      description: "The atlas currently spans a planet-scale population footprint through the live country index.",
      status: "Scale read resolved",
      cells: buildPulseCells(clamp(Math.round(Math.log10(metrics.totalPopulation || 1) * 2.2), 12, 28), 4),
    },
  ];
}

export function buildHomePageData(countries) {
  const regionMap = countries.reduce((accumulator, country) => {
    if (!country.region) {
      return accumulator;
    }

    accumulator[country.region] = (accumulator[country.region] ?? 0) + 1;
    return accumulator;
  }, {});

  const languageSet = new Set();
  const currencySet = new Set();

  let totalPopulation = 0;
  let borderLinkCount = 0;
  let mostConnectedCountry = null;

  countries.forEach((country) => {
    totalPopulation += country.population ?? 0;
    borderLinkCount += country.borders?.length ?? 0;

    Object.values(country.languages ?? {}).forEach((language) => {
      languageSet.add(language);
    });

    Object.values(country.currencies ?? {}).forEach((currency) => {
      if (currency.name) {
        currencySet.add(currency.name);
      }
    });

    if (
      !mostConnectedCountry ||
      (country.borders?.length ?? 0) > (mostConnectedCountry.borders?.length ?? 0)
    ) {
      mostConnectedCountry = country;
    }
  });

  const featured = [...countries]
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, 6)
    .map((country, index) => ({
      id: country.cca2,
      countryCode: country.cca2.toLowerCase(),
      countryName: country.name.common,
      place: country.capital?.[0] || country.name.common,
      lat: country.capitalInfo?.latlng?.[0] ?? country.latlng?.[0] ?? 0,
      lng: country.capitalInfo?.latlng?.[1] ?? country.latlng?.[1] ?? 0,
      flag: country.flags?.svg || country.flags?.png,
      region: country.region,
      capital: country.capital?.[0],
      population: country.population,
      summary: `${country.name.common} anchors ${country.region || "its region"} with strong travel scale, cultural range, and rich discovery potential.`,
      rank: index + 1,
    }));

  const regions = Object.entries(regionMap)
    .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)
    .map(([label, count]) => ({
      label,
      count,
      share: countries.length ? Math.round((count / countries.length) * 100) : 0,
      slug: label.toLowerCase(),
    }));

  const leadingRegion = regions[0];
  const biggestDestination = featured[0];
  const metrics = {
    countryCount: countries.length,
    regionCount: regions.length,
    totalPopulation,
    languageCount: languageSet.size,
    currencyCount: currencySet.size,
    borderLinkCount,
    leadingRegion,
    biggestDestination,
    mostConnectedCountry,
  };

  return {
    featured,
    regions,
    metrics: {
      ...metrics,
      pulseStates: buildHomePulseStates(metrics),
    },
  };
}
