import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export default function ProgressChart({
  graph,
}: {
  graph: { label: string; peso: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={graph}
        margin={{ top: 12, right: 10, left: -28, bottom: 0 }}
      >
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9a83ff" stopOpacity={0.34} />
            <stop offset="100%" stopColor="#9a83ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="#292940"
          strokeDasharray="4 6"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke="#8e8ca8"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a2c",
            border: "1px solid #39374d",
            borderRadius: 12,
            color: "#fff",
          }}
          formatter={(value: number) => [`${value} kg`, "Peso"]}
        />
        <Area
          type="monotone"
          dataKey="peso"
          stroke="#aa96ff"
          strokeWidth={3}
          fill="url(#weightFill)"
          dot={{ r: 5, fill: "#aa96ff", stroke: "#171726", strokeWidth: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
