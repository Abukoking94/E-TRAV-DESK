export function mapDestinationOverview({
  country,
  forecast,
  airQuality,
  marine,
  summary,
  development,
  place,
  lat,
  lng,
}) {
  return {
    id: `${country.cca2}-${place}`,
    countryCode: country.cca2.toLowerCase(),
    officialName: country.name.official || country.name.common,
    countryName: country.name.common,
    place,
    lat,
    lng,
    region: country.region,
    subregion: country.subregion,
    continents: country.continents ?? [],
    population: country.population,
    area: country.area,
    flag: country.flags?.svg || country.flags?.png,
    capital: country.capital?.[0],
    timezones: country.timezones ?? [],
    timezoneName: forecast?.timezone,
    timezoneAbbreviation: forecast?.timezone_abbreviation,
    borders: country.borders ?? [],
    languages: Object.values(country.languages ?? {}),
    currencies: Object.values(country.currencies ?? {}).map(
      (currency) => currency.name,
    ),
    summary:
      summary?.extract ||
      `Explore live weather, environmental conditions, and destination context for ${place}.`,
    current: forecast?.current,
    daily: forecast?.daily,
    airQuality: airQuality?.current,
    marine: marine?.current,
    development: development ?? null,
  };
}
