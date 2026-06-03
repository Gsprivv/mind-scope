import type { CheckIn } from "../../types";

interface Props {
  checkIns: CheckIn[];
}

export function ScoreLineChart({ checkIns }: Props) {
  const sorted = [...checkIns].sort(
    (a, b) =>
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const width = 400;
  const height = 200;
  const pad = { top: 16, right: 16, bottom: 36, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  if (sorted.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-sage-300 bg-sage-50/50 px-4 py-12 text-center text-sm text-sage-600">
        No check-ins yet to plot.
      </p>
    );
  }

  const points = sorted.map((c, i) => {
    const x =
      sorted.length === 1
        ? pad.left + innerW / 2
        : pad.left + (i / (sorted.length - 1)) * innerW;
    const y = pad.top + innerH - (c.score / 100) * innerH;
    return { x, y, score: c.score, date: c.completedAt };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[320px] max-w-xl"
        role="img"
        aria-label="Wellness score over time line chart"
      >
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = pad.top + innerH - (tick / 100) * innerH;
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke="#e4ebe4"
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-sage-500 text-[10px]"
              >
                {tick}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="#c9d6c9" fillOpacity="0.35" />
        <path
          d={linePath}
          fill="none"
          stroke="#5a755a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#5a755a" stroke="#faf8f5" strokeWidth="2" />
            <title>
              {new Date(p.date).toLocaleDateString("en-GB")}: {p.score}%
            </title>
          </g>
        ))}
        {points.length <= 6 &&
          points.map((p, i) => (
            <text
              key={`label-${i}`}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-sage-500 text-[9px]"
            >
              {new Date(p.date).toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              })}
            </text>
          ))}
      </svg>
      <p className="mt-2 text-center text-xs text-sage-500">
        Higher line = better wellness score over time
      </p>
    </div>
  );
}
