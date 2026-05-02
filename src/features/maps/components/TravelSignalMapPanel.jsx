import { useMemo, useState } from "react";
import { SignalMap } from "../../../components/maps/SignalMap";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SectionHeading } from "../../../components/ui/SectionHeading";
import { SelectField } from "../../../components/ui/SelectField";
import { ShellCard } from "../../../components/ui/ShellCard";
import {
  buildTravelSignalMapModel,
  travelSignalMapModeOptions,
} from "../travelSignalMap.utils";

export function TravelSignalMapPanel({
  eyebrow = "Map intelligence",
  title,
  description,
  entries,
  selectedMonth,
  scopeLabel,
  supportingLabel,
  defaultMode = "selected-month",
  modeOptions = travelSignalMapModeOptions,
  extraControls = null,
  footerPrefix,
}) {
  const [mapMode, setMapMode] = useState(defaultMode);

  const mapModel = useMemo(
    () =>
      buildTravelSignalMapModel(entries, {
        mapMode,
        selectedMonth,
        scopeLabel,
      }),
    [entries, mapMode, scopeLabel, selectedMonth],
  );

  const activeModeLabel =
    modeOptions.find((option) => option.value === mapMode)?.label || mapMode;
  const footer =
    footerPrefix ||
    `${mapModel.points.filter((point) => !String(point.id).endsWith("-centroid")).length} mapped nodes / ${activeModeLabel} across ${scopeLabel}`;

  return (
    <ShellCard>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:w-[640px]">
          {extraControls}
          <SelectField
            value={mapMode}
            onChange={(event) => setMapMode(event.target.value)}
            aria-label="Select travel signal map mode"
            options={modeOptions}
          />
        </div>
      </div>

      {supportingLabel ? (
        <div
          className="mt-5 rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400"
          role="status"
          aria-live="polite"
        >
          {supportingLabel}
        </div>
      ) : null}

      {mapModel.points.length ? (
        <div className="mt-8">
          <SignalMap
            points={mapModel.points}
            connections={mapModel.connections}
            selectedId={mapModel.selectedId}
            height={380}
            compactHeight={300}
            footer={footer}
          />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No mapped destinations in this scope."
            description="Once the current shortlist resolves coordinates and planning data, the desk will project them here."
          />
        </div>
      )}
    </ShellCard>
  );
}
