import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatTemp } from "../../lib/formatters";

export function ForecastChart({ daily }) {
  const data =
    daily?.time?.map((time, index) => ({
      time: new Date(time).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      high: daily.temperature_2m_max?.[index],
      low: daily.temperature_2m_min?.[index],
    })) ?? [];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="time" stroke="#64748b" />
          <YAxis stroke="#64748b" tickFormatter={formatTemp} width={48} />
          <Tooltip
            contentStyle={{
              background: "rgba(6, 10, 24, 0.94)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
            }}
            formatter={(value) => formatTemp(value)}
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke="#2797ff"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="#8edbff"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
