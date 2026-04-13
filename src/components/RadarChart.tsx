type RadarDatum = {
  label: string;
  value: number;
};

type RadarChartProps = {
  data: RadarDatum[];
};

export function RadarChart({ data }: RadarChartProps) {
  const center = 160;
  const radius = 116;
  const levels = [0.25, 0.5, 0.75, 1];

  const polarPoint = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius * value,
      y: center + Math.sin(angle) * radius * value,
    };
  };

  const polygon = data
    .map((item, index) => {
      const point = polarPoint(item.value / 100, index);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#07111f]/80 p-4">
      <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-[360px]">
        {levels.map((level) => (
          <polygon
            key={level}
            points={data
              .map((_, index) => {
                const point = polarPoint(level, index);
                return `${point.x},${point.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(148, 163, 184, 0.22)"
            strokeWidth="1"
          />
        ))}
        {data.map((_, index) => {
          const point = polarPoint(1, index);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(125, 211, 252, 0.18)"
              strokeWidth="1"
            />
          );
        })}
        <polygon
          points={polygon}
          fill="rgba(125, 211, 252, 0.18)"
          stroke="rgba(125, 211, 252, 0.9)"
          strokeWidth="2"
        />
        {data.map((item, index) => {
          const point = polarPoint(item.value / 100, index);
          const labelPoint = polarPoint(1.15, index);
          return (
            <g key={item.label}>
              <circle cx={point.x} cy={point.y} r="4" fill="#7dd3fc" />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                className="fill-slate-300 text-[11px]"
              >
                {item.label}
              </text>
              <text
                x={labelPoint.x}
                y={labelPoint.y + 14}
                textAnchor="middle"
                className="fill-white text-[14px] font-semibold"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
