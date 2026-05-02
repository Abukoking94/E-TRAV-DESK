import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { SignalMap } from "../../../components/maps/SignalMap";

function buildRoutePoints(destination, borderCountries) {
  const basePoint = {
    id: destination.countryCode,
    lat: destination.lat,
    lng: destination.lng,
    label: destination.place,
    secondaryLabel: destination.countryName,
    color: "#2797ff",
    size: 12,
    selected: true,
    labelOffsetX: 18,
    labelOffsetY: -18,
    keepLabelOnCompact: true,
    showInLegend: true,
    legendPriority: 3,
    description:
      destination.summary ||
      `${destination.place} is the active route anchor for this destination corridor.`,
    metaRows: [
      { label: "Country", value: destination.countryName },
      { label: "Timezone", value: destination.timezoneName || "Unavailable" },
      {
        label: "Current temp",
        value:
          destination.current?.temperature_2m != null
            ? `${Math.round(destination.current.temperature_2m)} deg C`
            : "Unavailable",
      },
      {
        label: "Borders",
        value: `${borderCountries.length}`,
      },
    ],
  };

  const neighborPoints = borderCountries
    .filter(
      (neighbor) =>
        Array.isArray(neighbor.latlng) &&
        neighbor.latlng.length >= 2 &&
        Number.isFinite(neighbor.latlng[0]) &&
        Number.isFinite(neighbor.latlng[1]),
    )
    .map((neighbor, index) => ({
      id: neighbor.cca2.toLowerCase(),
      lat: neighbor.latlng[0],
      lng: neighbor.latlng[1],
      label: index < 4 ? neighbor.name.common : null,
      secondaryLabel: index < 4 ? (neighbor.capital?.[0] || neighbor.region) : null,
      color: "#7dd3fc",
      size: 8,
      labelOffsetX: 14,
      labelOffsetY: index % 2 === 0 ? -14 : 24,
      showInLegend: index < 6,
      legendPriority: 2,
      description: `${neighbor.name.common} sits on the surrounding border corridor for ${destination.countryName}.`,
      metaRows: [
        { label: "Capital", value: neighbor.capital?.[0] || "Unavailable" },
        { label: "Region", value: neighbor.region || "Unavailable" },
        { label: "Code", value: neighbor.cca2 },
      ],
    }));

  return [basePoint, ...neighborPoints];
}

function buildRouteConnections(destination, borderCountries) {
  return borderCountries
    .filter(
      (neighbor) =>
        Array.isArray(neighbor.latlng) &&
        neighbor.latlng.length >= 2 &&
        Number.isFinite(neighbor.latlng[0]) &&
        Number.isFinite(neighbor.latlng[1]),
    )
    .map((neighbor) => ({
      from: destination.countryCode,
      to: neighbor.cca2.toLowerCase(),
      width: 2,
      opacity: 0.8,
    }));
}

export function DestinationRouteMap({ destination, borderCountries }) {
  const points = buildRoutePoints(destination, borderCountries);
  const connections = buildRouteConnections(destination, borderCountries);

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Geospatial route"
        title="Border route map"
        description="This layer places the destination inside its surrounding corridor so the page reads as a networked atlas, not a single isolated card."
      />

      <div className="mt-8">
        <SignalMap
          points={points}
          connections={connections}
          selectedId={destination.countryCode}
          height={360}
          compactHeight={300}
          footer={
            borderCountries.length
              ? `${borderCountries.length} bordering-country routes plotted from ${destination.place}`
              : `${destination.place} currently has no bordering-country routes in the country dataset`
          }
        />
      </div>
    </ShellCard>
  );
}
