import { AreaChart, Area } from "recharts";

const Sparkline = ({
  data = [],
  color = "#2563eb",
  width = 80,
  height = 36,
}) => {
  if (!data || data.length < 2) return null;

  const chartData = data.map((value) => ({ v: value }));

  const gradientId = `spark-grad-${color.replace("#", "")}`;

  return (
    <AreaChart
      width={width}
      height={height}
      data={chartData}
      margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.25} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      <Area
        type="monotone"
        dataKey="v"
        stroke={color}
        strokeWidth={2}
        fill={`url(#${gradientId})`}
        dot={false}
        activeDot={false}
        isAnimationActive={true}
        animationDuration={800}
        animationEasing="ease-out"
      />
    </AreaChart>
  );
};

export default Sparkline;
