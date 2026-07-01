import type { CheckIn } from "../../types";

interface Props {
  checkIns: CheckIn[];
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ScoreLineChart({ checkIns }: Props) {
  const sorted = [...checkIns].sort(
    (a, b) =>
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const width = 400;

  if (sorted.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-sage-300 bg-sage-50/50 px-4 py-12 text-center text-sm text-sage-600">
        No check-ins yet to plot.
      </p>
    );
  }

  const dayGroups = sorted.reduce<{ key: string; date: string; items: CheckIn[] }[]>(
    (groups, checkIn) => {
      const key = dayKey(checkIn.completedAt);
      const last = groups[groups.length - 1];
      if (last?.key === key) {
        last.items.push(checkIn);
      } else {
        groups.push({ key, date: checkIn.completedAt, items: [checkIn] });
      }
      return groups;
    },
    []
  );

  const dayCount = dayGroups.length;
  const maxTestsPerDay = Math.max(...dayGroups.map((g) => g.items.length), 1);
  const extraBottom = maxTestsPerDay > 1 ? (maxTestsPerDay - 1) * 10 + 12 : 0;
  const height = 200 + extraBottom;
  const pad = { top: 16, right: 16, bottom: 36 + extraBottom, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const dayX = new Map<string, number>();
  dayGroups.forEach((group, i) => {
    const x =
      dayCount === 1
        ? pad.left + innerW / 2
        : pad.left + (i / (dayCount - 1)) * innerW;
    dayX.set(group.key, x);
  });

  const points = sorted.map((checkIn) => {
    const group = dayGroups.find((g) =>
      g.items.some((item) => item.id === checkIn.id)
    )!;
    const groupIndex = group.items.findIndex((item) => item.id === checkIn.id);
    const baseX = dayX.get(group.key)!;
    const spread =
      group.items.length <= 1
        ? 0
        : (groupIndex - (group.items.length - 1) / 2) * 6;
    const x = baseX + spread;
    const y = pad.top + innerH - (checkIn.score / 100) * innerH;
    return {
      x,
      y,
      score: checkIn.score,
      date: checkIn.completedAt,
      dayKey: group.key,
    };
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
              {formatDayLabel(p.date)} {formatTime(p.date)}: {p.score}%
            </title>
          </g>
        ))}
        {dayGroups.map((group) => {
          const x = dayX.get(group.key)!;
          const showScores = group.items.length > 1;
          const labelY = height - pad.bottom + 14;
          return (
            <g key={group.key}>
              <text
                x={x}
                y={labelY}
                textAnchor="middle"
                className="fill-sage-500 text-[9px]"
              >
                {formatDayLabel(group.date)}
              </text>
              {showScores &&
                group.items.map((item, i) => (
                  <text
                    key={item.id}
                    x={x}
                    y={labelY + 12 + i * 10}
                    textAnchor="middle"
                    className="fill-sage-600 text-[8px] font-medium"
                  >
                    {item.score}%
                  </text>
                ))}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-sage-500">
        Higher line = better wellness score over time
      </p>
    </div>
  );
}
