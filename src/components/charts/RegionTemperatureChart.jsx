import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatTemp } from "../../lib/formatters";

const palette = ["#2797ff", "#8edbff", "#5ab6ff", "#49a7ff", "#6cc7ff", "#9edcff"];

export function RegionTemperatureChart({ data }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
          <YAxis stroke="#94a3b8" tickFormatter={formatTemp} width={50} />
          <Tooltip
            contentStyle={{
              background: "rgba(6, 10, 24, 0.96)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "18px",
            }}
            formatter={(value) => formatTemp(value)}
          />
          <Bar dataKey="temperature" radius={[12, 12, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`${entry.name}-${index}`}
                fill={palette[index % palette.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
