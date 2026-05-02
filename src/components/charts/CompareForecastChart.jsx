import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatTemp } from "../../lib/formatters";

export function CompareForecastChart({ data, destinations }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" tickFormatter={formatTemp} width={52} />
          <Tooltip
            contentStyle={{
              background: "rgba(6, 10, 24, 0.96)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "18px",
            }}
            formatter={(value) => formatTemp(value)}
          />
          <Legend />
          {destinations.map((destination) => (
            <Line
              key={destination.chartKey}
              type="monotone"
              dataKey={destination.chartKey}
              name={destination.place}
              stroke={destination.color}
              strokeWidth={3}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
