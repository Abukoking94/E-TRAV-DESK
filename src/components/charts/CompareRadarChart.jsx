import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export function CompareRadarChart({ data, destinations }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(6, 10, 24, 0.96)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "18px",
            }}
            formatter={(value) => `${Math.round(value)}/100`}
          />
          <Legend />
          {destinations.map((destination) => (
            <Radar
              key={destination.chartKey}
              name={destination.place}
              dataKey={destination.chartKey}
              stroke={destination.color}
              fill={destination.color}
              fillOpacity={0.18}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
