import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export function Sparkline({ data, height = 50 }) {
  if (!data || data.length < 2) return null;

  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "var(--color-bg)",
            color: "var(--color-text)",
            padding: "6px 10px",
            borderRadius: 8,
            boxShadow: "var(--shadow-md)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ${payload[0].value}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "var(--color-primary)",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#sparkFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
