import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatTemp } from "../../lib/formatters";

export function SeasonalityChart({ months = [] }) {
  const data = months.map((month) => ({
    month: month.label,
    temperature: month.temperatureMean,
    precipitation: month.precipitationTotal,
    score: month.score,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis
            yAxisId="temp"
            stroke="#94a3b8"
            tickFormatter={formatTemp}
            width={48}
          />
          <YAxis
            yAxisId="rain"
            orientation="right"
            stroke="#94a3b8"
            tickFormatter={(value) => `${formatNumber(value)} mm`}
            width={54}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.94)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              borderRadius: "18px",
            }}
            formatter={(value, key) => {
              if (key === "temperature") {
                return formatTemp(value);
              }

              if (key === "precipitation") {
                return `${formatNumber(value)} mm`;
              }

              if (key === "score") {
                return `${Math.round(value)} / 100`;
              }

              return formatNumber(value);
            }}
          />
          <Bar
            yAxisId="rain"
            dataKey="precipitation"
            fill="rgba(142, 219, 255, 0.25)"
            radius={[12, 12, 0, 0]}
            barSize={18}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            stroke="#2797ff"
            strokeWidth={3}
            dot={{ r: 3, fill: "#2797ff", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
