function getCountryCoords(country) {
  return {
    lat: country.capitalInfo?.latlng?.[0] ?? country.latlng?.[0] ?? 0,
    lng: country.capitalInfo?.latlng?.[1] ?? country.latlng?.[1] ?? 0,
  };
}

function rankDesc(items, selector) {
  return [...items].sort(
    (left, right) => (selector(right) ?? -Infinity) - (selector(left) ?? -Infinity),
  );
}

function rankAsc(items, selector) {
  return [...items].sort(
    (left, right) => (selector(left) ?? Infinity) - (selector(right) ?? Infinity),
  );
}

function sum(values) {
  return values.reduce((total, value) => total + (value ?? 0), 0);
}

function buildBaseDestination(country) {
  const coords = getCountryCoords(country);

  return {
    id: country.cca2,
    countryCode: country.cca2.toLowerCase(),
    countryName: country.name.common,
    place: country.capital?.[0] || country.name.common,
    lat: coords.lat,
    lng: coords.lng,
    flag: country.flags?.svg || country.flags?.png,
    region: country.region,
    capital: country.capital?.[0] || country.name.common,
    population: country.population ?? 0,
    borderCount: country.borders?.length ?? 0,
  };
}

function buildClimateSignal(country, forecast) {
  const base = buildBaseDestination(country);
  const current = forecast?.current ?? {};
  const daily = forecast?.daily ?? {};

  return {
    ...base,
    currentTemp: current.temperature_2m ?? null,
    weatherCode: current.weather_code ?? null,
    rainChance: daily.precipitation_probability_max?.[0] ?? null,
    windSpeed: current.wind_speed_10m ?? null,
  };
}

function buildStoryRecord(country, summary, climateSignal) {
  const base = buildBaseDestination(country);

  return {
    ...base,
    summary: summary?.extract,
    description: summary?.description,
    image: summary?.thumbnail?.source || base.flag,
    currentTemp: climateSignal?.currentTemp ?? null,
    rainChance: climateSignal?.rainChance ?? null,
    windSpeed: climateSignal?.windSpeed ?? null,
  };
}

function storyScore(item) {
  let score = Math.log10((item.population ?? 1) + 1) * 8;

  if (item.currentTemp != null) {
    score += Math.max(0, 34 - Math.abs(item.currentTemp - 24) * 1.4);
  }

  if (item.rainChance != null) {
    score += Math.max(0, 28 - item.rainChance * 0.32);
  }

  if (item.summary) {
    score += 12;
  }

  return score;
}

export function buildJournalClimateSignals(countries, forecasts) {
  return countries.map((country, index) => buildClimateSignal(country, forecasts[index]));
}

export function buildJournalOverview(countries, climateSignals) {
  const regions = new Set(countries.map((country) => country.region).filter(Boolean));
  const warmestSignal = rankDesc(
    climateSignals.filter((item) => item.currentTemp != null),
    (item) => item.currentTemp,
  )[0];
  const driestSignal = rankAsc(
    climateSignals.filter((item) => item.rainChance != null),
    (item) => item.rainChance,
  )[0];
  const borderLeader = rankDesc(countries, (country) => country.borders?.length ?? 0)[0];

  return {
    countryCount: countries.length,
    regionCount: regions.size,
    totalPopulation: sum(countries.map((country) => country.population)),
    warmestSignal,
    driestSignal,
    borderLeader,
  };
}

export function buildJournalSpotlight(countries, summaries, climateSignals) {
  const climateLookup = new Map(
    climateSignals.map((signal) => [signal.countryCode, signal]),
  );

  const stories = countries.map((country, index) =>
    buildStoryRecord(
      country,
      summaries[index],
      climateLookup.get(country.cca2.toLowerCase()),
    ),
  );

  const ranked = rankDesc(stories, storyScore);

  return {
    primary: ranked[0] ?? null,
    secondary: ranked.slice(1, 4),
  };
}

export function buildJournalThemes(countries, climateSignals) {
  const climateLookup = new Map(
    climateSignals.map((signal) => [signal.countryCode, signal]),
  );

  const combined = countries.map((country) => ({
    ...buildBaseDestination(country),
    ...(climateLookup.get(country.cca2.toLowerCase()) || {}),
  }));

  return [
    {
      id: "warm",
      label: "Warm windows",
      description: "Capitals currently leaning hottest in the live weather sample.",
      items: rankDesc(
        combined.filter((item) => item.currentTemp != null),
        (item) => item.currentTemp,
      ).slice(0, 4),
      metric: "temp",
    },
    {
      id: "dry",
      label: "Dry reads",
      description: "Places carrying the lightest immediate rain signal.",
      items: rankAsc(
        combined.filter((item) => item.rainChance != null),
        (item) => item.rainChance,
      ).slice(0, 4),
      metric: "percent",
    },
    {
      id: "scale",
      label: "Urban gravity",
      description: "Large-scale countries that anchor the editorial desk.",
      items: rankDesc(combined, (item) => item.population).slice(0, 4),
      metric: "population",
    },
    {
      id: "border",
      label: "Border stories",
      description: "Countries with stronger neighboring-country context for follow-up exploration.",
      items: rankDesc(countries, (country) => country.borders?.length ?? 0)
        .slice(0, 4)
        .map((country) => ({
          ...buildBaseDestination(country),
          borderCount: country.borders?.length ?? 0,
        })),
      metric: "border",
    },
  ];
}

export function buildJournalRegionNarratives(countries, summariesByRegion) {
  const regionMap = countries.reduce((accumulator, country) => {
    if (!country.region) {
      return accumulator;
    }

    if (!accumulator[country.region]) {
      accumulator[country.region] = [];
    }

    accumulator[country.region].push(country);
    return accumulator;
  }, {});

  return Object.entries(regionMap)
    .map(([region, items]) => {
      const sortedByPopulation = rankDesc(items, (country) => country.population);
      const anchor = sortedByPopulation[0];

      return {
        id: region.toLowerCase(),
        region,
        count: items.length,
        totalPopulation: sum(items.map((item) => item.population)),
        anchorCountry: anchor?.name.common,
        summary:
          summariesByRegion[region]?.extract ||
          `${region} is one of the strongest editorial lanes in the desk, with enough scale and range to support deeper destination narratives.`,
      };
    })
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);
}

export function buildJournalStories(countries, summaries, climateSignals) {
  const climateLookup = new Map(
    climateSignals.map((signal) => [signal.countryCode, signal]),
  );

  return countries.map((country, index) =>
    buildStoryRecord(
      country,
      summaries[index],
      climateLookup.get(country.cca2.toLowerCase()),
    ),
  );
}
