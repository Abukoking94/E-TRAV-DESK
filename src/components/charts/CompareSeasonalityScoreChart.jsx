import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CompareSeasonalityScoreChart({ data = [], destinations = [] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis dataKey="label" stroke="#94a3b8" />
          <YAxis
            stroke="#94a3b8"
            width={42}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.94)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              borderRadius: "18px",
            }}
            formatter={(value) =>
              value == null ? "Unavailable" : `${Math.round(value)} / 100`
            }
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel || label}
          />
          {destinations.map((destination) => (
            <Line
              key={destination.chartKey}
              type="monotone"
              dataKey={destination.chartKey}
              stroke={destination.color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
