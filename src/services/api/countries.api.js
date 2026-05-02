import { fetchJson } from "./fetchJson";
import { countriesSchema, countrySchema } from "../schemas/country.schema";

const COUNTRY_LIST_FIELDS =
  "name,cca2,capital,region,population,latlng,borders,languages,currencies,flags";

export async function getAllCountries() {
  const json = await fetchJson(
    `https://restcountries.com/v3.1/all?fields=${COUNTRY_LIST_FIELDS}`,
  );
  return countriesSchema.parse(json);
}

export async function getCountryByCode(countryCode) {
  const json = await fetchJson(
    `https://restcountries.com/v3.1/alpha/${countryCode.toUpperCase()}`,
  );

  if (Array.isArray(json)) {
    return countrySchema.parse(json[0]);
  }

  return countrySchema.parse(json);
}

export async function getCountriesByRegion(region) {
  const json = await fetchJson(
    `https://restcountries.com/v3.1/region/${region}?fields=${COUNTRY_LIST_FIELDS}`,
  );
  return countriesSchema.parse(json);
}

export async function getCountriesByCodes(codes) {
  if (!codes.length) {
    return [];
  }

  const codeParam = codes.join(",");
  const json = await fetchJson(
    `https://restcountries.com/v3.1/alpha?codes=${codeParam}&fields=name,cca2,cca3,capital,region,latlng,flags`,
  );
  return countriesSchema.parse(json);
}
