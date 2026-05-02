import { describeWeatherCode } from "../../lib/destinationInsights";

function getCountryCoords(country) {
  return {
    lat: country.capitalInfo?.latlng?.[0] ?? country.latlng?.[0] ?? 0,
    lng: country.capitalInfo?.latlng?.[1] ?? country.latlng?.[1] ?? 0,
  };
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
    capital: country.capital?.[0],
    population: country.population,
  };
}

function sum(values) {
  return values.reduce((total, value) => total + (value ?? 0), 0);
}

function average(values) {
  const filtered = values.filter((value) => value != null && !Number.isNaN(value));

  if (!filtered.length) {
    return null;
  }

  return filtered.reduce((total, value) => total + value, 0) / filtered.length;
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

export function buildRegionClimateDestinations(countries, forecasts) {
  return countries.map((country, index) => {
    const base = buildBaseDestination(country);
    const forecast = forecasts[index];
    const current = forecast?.current ?? {};
    const daily = forecast?.daily ?? {};
    const temp = current.temperature_2m ?? null;

    return {
      ...base,
      currentTemp: temp,
      weatherLabel: describeWeatherCode(current.weather_code),
      rainChance: daily.precipitation_probability_max?.[0] ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      summary:
        temp != null
          ? `${base.place} is currently reading ${Math.round(temp)} deg C with ${describeWeatherCode(
              current.weather_code,
            ).toLowerCase()} conditions in the ${country.region} hub.`
          : `${country.name.common} is part of the ${country.region} discovery surface and ready for deeper climate reading.`,
    };
  });
}

export function buildRegionOverview(countries, climateDestinations) {
  const warmestDestination = rankDesc(
    climateDestinations.filter((destination) => destination.currentTemp != null),
    (destination) => destination.currentTemp,
  )[0];
  const largestCountry = rankDesc(countries, (country) => country.population)[0];

  return {
    countryCount: countries.length,
    totalPopulation: sum(countries.map((country) => country.population)),
    averageTemp: (() => {
      const value = average(
        climateDestinations.map((destination) => destination.currentTemp),
      );
      return value != null ? Math.round(value) : null;
    })(),
    warmestDestination,
    largestCountry,
  };
}

export function buildRegionCollections(countries, climateDestinations) {
  const largestCountries = rankDesc(countries, (country) => country.population)
    .slice(0, 4)
    .map((country) => ({
      id: country.cca2,
      title: country.name.common,
      subtitle: country.capital?.[0] || "Capital unavailable",
      value: country.population,
      kind: "population",
    }));

  const warmestCapitals = rankDesc(
    climateDestinations.filter((destination) => destination.currentTemp != null),
    (destination) => destination.currentTemp,
  )
    .slice(0, 4)
    .map((destination) => ({
      id: destination.id,
      title: destination.place,
      subtitle: destination.countryName,
      value: destination.currentTemp,
      kind: "temp",
    }));

  const driestSignals = rankAsc(
    climateDestinations.filter((destination) => destination.rainChance != null),
    (destination) => destination.rainChance,
  )
    .slice(0, 4)
    .map((destination) => ({
      id: destination.id,
      title: destination.place,
      subtitle: destination.countryName,
      value: destination.rainChance,
      kind: "percent",
    }));

  return [
    {
      id: "scale",
      label: "Population scale",
      description: "Large-population countries that anchor the regional network.",
      items: largestCountries,
    },
    {
      id: "warmth",
      label: "Warmest live reads",
      description: "The warmest capitals in the current live weather sample.",
      items: warmestCapitals,
    },
    {
      id: "dry",
      label: "Lower rain windows",
      description: "Current capitals showing the lightest short-range rain risk.",
      items: driestSignals,
    },
  ];
}

export function buildRegionDestinationCards(countries, climateDestinations) {
  const climateLookup = new Map(
    climateDestinations.map((destination) => [destination.countryCode, destination]),
  );

  return rankDesc(countries, (country) => country.population)
    .slice(0, 12)
    .map((country) => {
      const base = buildBaseDestination(country);
      const climate = climateLookup.get(base.countryCode);

      return {
        ...base,
        temperature: climate?.currentTemp ?? null,
        summary:
          climate?.summary ||
          `${country.name.common} is part of the ${country.region} hub and ready for destination-level analysis.`,
      };
    });
}

export function buildRegionSpotlights(countries, summaries) {
  const spotlightCountries = rankDesc(countries, (country) => country.population).slice(
    0,
    3,
  );

  return spotlightCountries.map((country, index) => ({
    id: country.cca2,
    title: country.name.common,
    region: country.region,
    capital: country.capital?.[0] || "Capital unavailable",
    population: country.population,
    flag: country.flags?.svg || country.flags?.png,
    summary:
      summaries[index]?.extract ||
      `${country.name.common} anchors the regional desk through scale, visibility, and strong destination context.`,
  }));
}

export function buildRegionClimateChartData(climateDestinations) {
  return climateDestinations.map((destination) => ({
    name: destination.place,
    temperature: destination.currentTemp,
  }));
}
