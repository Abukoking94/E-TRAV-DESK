import { useMemo, useState } from "react";
import { SelectField } from "../../../components/ui/SelectField";
import { TravelSignalMapPanel } from "../../maps/components/TravelSignalMapPanel";
import { formatNumber } from "../../../lib/formatters";
import { TRAVEL_PROFILE_OPTIONS } from "../../../lib/scoring/travelProfileScore";
import { buildTravelWindowPlan } from "../../../lib/scoring/travelWindowScore";
import { MONTH_META } from "../../../lib/seasonality";

const monthOptions = MONTH_META.map((month) => ({
  value: String(month.month),
  label: month.fullLabel,
}));

function buildRegionMapEntries(
  countries,
  climateDestinations,
  seasonalityProfiles,
  riskSnapshotMap,
  profileId,
  selectedMonth,
) {
  const climateLookup = new Map(
    climateDestinations.map((destination) => [destination.countryCode, destination]),
  );
  const seasonalityLookup = new Map(
    climateDestinations.map((destination, index) => [
      destination.countryCode,
      seasonalityProfiles[index] ?? null,
    ]),
  );

  return [...countries]
    .filter(
      (country) =>
        Array.isArray(country.latlng) &&
        country.latlng.length >= 2 &&
        Number.isFinite(country.latlng[0]) &&
        Number.isFinite(country.latlng[1]),
    )
    .sort((left, right) => (right.population ?? 0) - (left.population ?? 0))
    .map((country) => {
      const climate = climateLookup.get(country.cca2.toLowerCase());
      const seasonalityProfile = seasonalityLookup.get(country.cca2.toLowerCase());
      const plan = seasonalityProfile
        ? buildTravelWindowPlan(seasonalityProfile, profileId)
        : null;
      const monthData =
        plan?.scoredMonths?.find((item) => item.month === selectedMonth) ?? null;

      return {
        id: country.cca2.toLowerCase(),
        countryCode: country.cca2.toLowerCase(),
        lat: country.latlng[0],
        lng: country.latlng[1],
        place: climate?.place || country.capital?.[0] || country.name.common,
        countryName: country.name.common,
        region: country.region,
        population: country.population,
        currentTemp: climate?.currentTemp ?? null,
        plan,
        monthData,
        window: plan?.recommendedWindow ?? null,
        topMonth: plan?.topMonth ?? null,
        riskSnapshot: riskSnapshotMap.get(country.cca2.toLowerCase()) ?? null,
        summary:
          climate?.summary ||
          `${country.name.common} is contributing a structural location signal to the ${country.region} route field.`,
      };
    });
}

export function RegionSignalMap({
  countries,
  climateDestinations,
  seasonalityProfiles = [],
  riskSnapshotMap = new Map(),
  regionTitle,
}) {
  const [profileId, setProfileId] = useState("warm-dry");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const entries = useMemo(
    () =>
      buildRegionMapEntries(
        countries,
        climateDestinations,
        seasonalityProfiles,
        riskSnapshotMap,
        profileId,
        selectedMonth,
      ),
    [
      climateDestinations,
      countries,
      profileId,
      riskSnapshotMap,
      seasonalityProfiles,
      selectedMonth,
    ],
  );

  const profileLabel =
    TRAVEL_PROFILE_OPTIONS.find((option) => option.value === profileId)?.label ||
    "Travel profile";
  const sampledCount = seasonalityProfiles.filter(Boolean).length;

  return (
    <TravelSignalMapPanel
      eyebrow="Map layer"
      title={`${regionTitle} route field`}
      description="A geospatial read of the region that can now switch between selected-month heat, best-window strength, top-month clustering, and sampled live risk overlay."
      entries={entries}
      selectedMonth={selectedMonth}
      scopeLabel={`${regionTitle} regional desk`}
      supportingLabel={`${profileLabel} / ${
        monthOptions.find((option) => option.value === String(selectedMonth))?.label ||
        `Month ${selectedMonth}`
      } / ${sampledCount} sampled seasonality nodes`}
      extraControls={
        <>
          <SelectField
            value={profileId}
            onChange={(event) => setProfileId(event.target.value)}
            options={TRAVEL_PROFILE_OPTIONS}
          />
          <SelectField
            value={String(selectedMonth)}
            onChange={(event) => setSelectedMonth(Number(event.target.value))}
            options={monthOptions}
          />
        </>
      }
      footerPrefix={`${entries.length} mapped country signals / ${sampledCount} sampled seasonality nodes / ${formatNumber(
        entries.reduce((total, entry) => total + (entry.population ?? 0), 0),
      )} total population context`}
    />
  );
}
