import type { RiskPercentages } from "../../lib/historyStats";
import { RISK_LABELS } from "../../lib/risk";

const SLICES: {
  key: keyof Pick<RiskPercentages, "low" | "average" | "high">;
  color: string;
}[] = [
  { key: "low", color: "#5a755a" },
  { key: "average", color: "#d97706" },
  { key: "high", color: "#c53030" },
];

export function RiskPieChart({ data }: { data: RiskPercentages }) {
  const total = data.low + data.average + data.high;
  const hasData = total > 0;

  let cumulative = 0;
  const radius = 48;
  const cx = 60;
  const cy = 60;

  const slices = SLICES.map(({ key, color }) => {
    const pct = hasData ? data[key] : 0;
    const startAngle = (cumulative / 100) * 360;
    cumulative += pct;
    const endAngle = (cumulative / 100) * 360;

    const start = polar(cx, cy, radius, startAngle);
    const end = polar(cx, cy, radius, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const path =
      pct <= 0
        ? ""
        : pct >= 100
          ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
          : `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;

    return { key, color, pct, path };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <svg
        viewBox="0 0 120 120"
        className="h-40 w-40 shrink-0"
        role="img"
        aria-label="Risk distribution pie chart"
      >
        {!hasData ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="#e4ebe4"
            stroke="#c9d6c9"
          />
        ) : (
          slices.map(
            (s) =>
              s.path && (
                <path key={s.key} d={s.path} fill={s.color} stroke="#fff" strokeWidth="1" />
              )
          )
        )}
      </svg>
      <ul className="space-y-2 text-sm">
        {SLICES.map(({ key, color }) => (
          <li key={key} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sage-700">
              {RISK_LABELS[key]}: <strong>{data[key]}%</strong>
              <span className="text-sage-500">
                {" "}
                ({data.counts[key]} check-in
                {data.counts[key] === 1 ? "" : "s"})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}
