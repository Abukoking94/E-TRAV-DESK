import { useEffect, useMemo, useState } from "react";
import {
  buildGeoBounds,
  buildGeoConnectionPath,
  projectGeoPoint,
} from "../../lib/geo";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const WIDTH = 1000;
const HEIGHT = 560;

function buildGrid(axisLength, count) {
  return Array.from({ length: count }, (_, index) => {
    if (count === 1) {
      return axisLength / 2;
    }

    return (axisLength / (count - 1)) * index;
  });
}

export function SignalMap({
  points,
  connections = [],
  bounds,
  selectedId,
  height = 360,
  compactHeight = 300,
  footer,
}) {
  const isCompact = useMediaQuery("(max-width: 767px)");
  const validPoints = useMemo(
    () =>
      points.filter(
        (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng),
      ),
    [points],
  );

  const computedBounds = useMemo(
    () => bounds ?? buildGeoBounds(validPoints),
    [bounds, validPoints],
  );

  const projectedPoints = useMemo(
    () =>
      validPoints.map((point) => ({
        ...point,
        ...projectGeoPoint(point.lat, point.lng, {
          width: WIDTH,
          height: HEIGHT,
          bounds: computedBounds,
        }),
      })),
    [computedBounds, validPoints],
  );

  const pointLookup = useMemo(
    () => new Map(projectedPoints.map((point) => [point.id, point])),
    [projectedPoints],
  );

  const projectedConnections = useMemo(
    () =>
      connections
        .map((connection) => ({
          ...connection,
          fromPoint: pointLookup.get(connection.from),
          toPoint: pointLookup.get(connection.to),
        }))
        .filter((connection) => connection.fromPoint && connection.toPoint),
    [connections, pointLookup],
  );

  const [activePointId, setActivePointId] = useState(
    selectedId ?? validPoints[0]?.id ?? null,
  );

  useEffect(() => {
    if (!validPoints.length) {
      setActivePointId(null);
      return;
    }

    const nextActiveId =
      validPoints.find((point) => point.id === activePointId)?.id ??
      validPoints.find((point) => point.id === selectedId)?.id ??
      validPoints[0]?.id ??
      null;

    if (nextActiveId !== activePointId) {
      setActivePointId(nextActiveId);
    }
  }, [activePointId, selectedId, validPoints]);

  const activePoint =
    projectedPoints.find((point) => point.id === activePointId) ?? null;

  const legendPoints = projectedPoints
    .filter((point) => point.showInLegend ?? Boolean(point.label))
    .sort(
      (left, right) => (right.legendPriority ?? 0) - (left.legendPriority ?? 0),
    )
    .slice(0, isCompact ? 4 : 6);

  const verticalGrid = buildGrid(WIDTH, 7);
  const horizontalGrid = buildGrid(HEIGHT, 5);

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5">
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          style={{ height: isCompact ? compactHeight : height }}
          role="img"
          aria-label="Geospatial signal map"
        >
          <defs>
            <linearGradient id="signal-map-route" x1="0%" x2="100%">
              <stop offset="0%" stopColor="rgba(125, 211, 252, 0.18)" />
              <stop offset="50%" stopColor="rgba(39, 151, 255, 0.72)" />
              <stop offset="100%" stopColor="rgba(90, 182, 255, 0.32)" />
            </linearGradient>
            <linearGradient id="signal-map-surface" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>

          <rect
            x="0"
            y="0"
            width={WIDTH}
            height={HEIGHT}
            fill="url(#signal-map-surface)"
          />

          {verticalGrid.map((x) => (
            <line
              key={`vx-${x}`}
              x1={x}
              x2={x}
              y1="0"
              y2={HEIGHT}
              stroke="var(--theme-grid-line)"
              strokeWidth="1"
            />
          ))}

          {horizontalGrid.map((y) => (
            <line
              key={`hy-${y}`}
              x1="0"
              x2={WIDTH}
              y1={y}
              y2={y}
              stroke="var(--theme-grid-line)"
              strokeWidth="1"
            />
          ))}

          <rect
            x="18"
            y="18"
            width={WIDTH - 36}
            height={HEIGHT - 36}
            rx="28"
            fill="none"
            stroke="var(--theme-border-soft)"
          />

          {projectedConnections.map((connection) => (
            <path
              key={`${connection.from}-${connection.to}`}
              d={buildGeoConnectionPath(
                connection.fromPoint,
                connection.toPoint,
                connection.curvature,
              )}
              fill="none"
              stroke={connection.color || "url(#signal-map-route)"}
              strokeWidth={
                activePointId &&
                (connection.from === activePointId || connection.to === activePointId)
                  ? (connection.width || 2) + 1
                  : connection.width || 2
              }
              strokeLinecap="round"
              opacity={
                activePointId &&
                connection.from !== activePointId &&
                connection.to !== activePointId
                  ? 0.24
                  : connection.opacity ?? 0.9
              }
              strokeDasharray={connection.dashed ? "6 8" : undefined}
            />
          ))}

          {projectedPoints.map((point) => {
            const isSelected = point.id === selectedId || point.selected;
            const isActive = point.id === activePointId;
            const radius = point.size ?? (isSelected ? 11 : 8);
            const fill = point.color || "#2797ff";
            const labelOffsetX = point.labelOffsetX ?? 14;
            const labelOffsetY = point.labelOffsetY ?? -14;
            const showLabel =
              point.label &&
              (!isCompact || isActive || isSelected || point.keepLabelOnCompact);

            return (
              <g
                key={point.id}
                role="button"
                tabIndex={0}
                aria-label={point.label || point.id}
                onMouseEnter={() => setActivePointId(point.id)}
                onFocus={() => setActivePointId(point.id)}
                onClick={() => setActivePointId(point.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActivePointId(point.id);
                  }
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius + (isActive ? 12 : 8)}
                  fill={fill}
                  opacity={isActive || isSelected ? 0.18 : 0.08}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isActive ? radius + 1.5 : radius}
                  fill={fill}
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth={isActive || isSelected ? 2 : 1.2}
                />
                {showLabel ? (
                  <>
                    <rect
                      x={point.x + labelOffsetX - 10}
                      y={point.y + labelOffsetY - 18}
                      rx="14"
                      width={Math.max(point.label.length * 7.3 + 22, 74)}
                      height={point.secondaryLabel ? 38 : 26}
                      fill="rgba(5, 8, 22, 0.76)"
                      stroke="var(--theme-border-soft)"
                    />
                    <text
                      x={point.x + labelOffsetX}
                      y={point.y + labelOffsetY}
                      fill="var(--theme-text-primary)"
                      fontSize="13"
                      fontWeight="600"
                    >
                      {point.label}
                    </text>
                    {point.secondaryLabel ? (
                      <text
                        x={point.x + labelOffsetX}
                        y={point.y + labelOffsetY + 15}
                        fill="var(--theme-text-secondary)"
                        fontSize="11"
                      >
                        {point.secondaryLabel}
                      </text>
                    ) : null}
                  </>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-4 border-t border-white/10 px-4 py-4 sm:px-5 sm:py-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-atlas-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Active signal
          </p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">
                {activePoint?.label || "Signal node"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {activePoint?.secondaryLabel ||
                  activePoint?.description ||
                  "Select a node to inspect its route context."}
              </p>
            </div>
            <div
              className="mt-1 h-3.5 w-3.5 rounded-full"
              style={{ background: activePoint?.color || "#2797ff" }}
            />
          </div>
          {activePoint?.description && activePoint?.secondaryLabel ? (
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {activePoint.description}
            </p>
          ) : null}
          {activePoint?.metaRows?.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {activePoint.metaRows.map((row) => (
                <div
                  key={`${activePoint.id}-${row.label}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {row.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Signal nodes
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {legendPoints.map((point) => {
              const isActive = point.id === activePointId;

              return (
                <button
                  key={point.id}
                  type="button"
                  className={`rounded-full border px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? "border-neon/35 bg-neon/12 text-white"
                      : "border-white/10 bg-atlas-950/35 text-slate-300 hover:border-white/20 hover:bg-white/5"
                  }`}
                  onMouseEnter={() => setActivePointId(point.id)}
                  onFocus={() => setActivePointId(point.id)}
                  onClick={() => setActivePointId(point.id)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: point.color || "#2797ff" }}
                    />
                    <span>{point.label || point.id}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {footer ? (
        <div className="border-t border-white/10 px-5 py-4 text-sm text-slate-400">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
