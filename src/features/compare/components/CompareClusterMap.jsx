import { SectionHeading } from "../../../components/ui/SectionHeading";
import { ShellCard } from "../../../components/ui/ShellCard";
import { SignalMap } from "../../../components/maps/SignalMap";
import { calculateGeoCentroid } from "../../../lib/geo";

function buildClusterPoints(destinations) {
  const points = destinations
    .filter(
      (destination) =>
        Number.isFinite(destination.lat) && Number.isFinite(destination.lng),
    )
    .map((destination, index) => ({
      id: destination.id,
      lat: destination.lat,
      lng: destination.lng,
      label: destination.place,
      secondaryLabel:
        destination.currentTemp != null
          ? `${Math.round(destination.currentTemp)} deg C`
          : destination.countryName,
      color: destination.color,
      size: 10 + Math.max(0, 2 - index),
      selected: index === 0,
      labelOffsetY: index % 2 === 0 ? -16 : 26,
      keepLabelOnCompact: index === 0,
      showInLegend: true,
      legendPriority: 3 - index,
      description:
        destination.readiness ||
        `${destination.place} is active on the compare board.`,
      metaRows: [
        { label: "Country", value: destination.countryName },
        {
          label: "Travel index",
          value:
            destination.travelIndex != null
              ? `${destination.travelIndex}/100`
              : "Unavailable",
        },
        {
          label: "Current temp",
          value:
            destination.currentTemp != null
              ? `${Math.round(destination.currentTemp)} deg C`
              : "Unavailable",
        },
        {
          label: "AQI",
          value: destination.aqiSummary?.label || "Unavailable",
        },
      ],
    }));

  const centroid = calculateGeoCentroid(points);

  if (!centroid) {
    return points;
  }

  return [
    ...points,
    {
      id: "cluster-centroid",
      lat: centroid.lat,
      lng: centroid.lng,
      label: "Board centroid",
      secondaryLabel: `${points.length} active destinations`,
      color: "#5ab6ff",
      size: 7,
      labelOffsetX: 18,
      labelOffsetY: 20,
      showInLegend: false,
      description:
        "A midpoint across the active compare board, useful for reading how tightly or widely the destinations are spread.",
      metaRows: [
        { label: "Board span", value: `${points.length} destinations` },
        { label: "Mode", value: "Spatial centroid" },
      ],
    },
  ];
}

function buildClusterConnections(destinations) {
  return destinations
    .filter(
      (destination) =>
        Number.isFinite(destination.lat) && Number.isFinite(destination.lng),
    )
    .map((destination) => ({
      from: destination.id,
      to: "cluster-centroid",
      color: destination.color,
      width: 2,
      opacity: 0.78,
      dashed: true,
      curvature: 0.12,
    }));
}

export function CompareClusterMap({ destinations }) {
  const points = buildClusterPoints(destinations);
  const connections = buildClusterConnections(destinations);

  return (
    <ShellCard>
      <SectionHeading
        eyebrow="Map cluster"
        title="Board geography"
        description="A global scatter of the compare board so you can read spatial spread alongside weather and readiness scoring."
      />

      <div className="mt-8">
        <SignalMap
          points={points}
          connections={connections}
          height={360}
          compactHeight={300}
          footer={`${destinations.length} destinations projected into one compare footprint`}
        />
      </div>
    </ShellCard>
  );
}
