import type { CheckIn } from "../types";

function weekStart(d: Date): string {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy.toISOString().slice(0, 10);
}

function avgScore(items: CheckIn[]): number | null {
  if (items.length === 0) return null;
  const sum = items.reduce((acc, c) => acc + c.score, 0);
  return Math.round(sum / items.length);
}

export interface WeeklyReport {
  weekLabel: string;
  testsThisWeek: number;
  avgThisWeek: number | null;
  avgLastWeek: number | null;
  changeVsLastWeek: number | null;
  headline: string;
  summary: string;
}

export function buildWeeklyReport(checkIns: CheckIn[]): WeeklyReport | null {
  if (checkIns.length === 0) return null;

  const now = new Date();
  const thisWeekKey = weekStart(now);
  const lastWeekDate = new Date(now);
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeekKey = weekStart(lastWeekDate);

  const thisWeek = checkIns.filter(
    (c) => weekStart(new Date(c.completedAt)) === thisWeekKey
  );
  const lastWeek = checkIns.filter(
    (c) => weekStart(new Date(c.completedAt)) === lastWeekKey
  );

  const avgThisWeek = avgScore(thisWeek);
  const avgLastWeek = avgScore(lastWeek);
  const changeVsLastWeek =
    avgThisWeek != null && avgLastWeek != null
      ? avgThisWeek - avgLastWeek
      : null;

  const weekLabel = new Date(thisWeekKey + "T12:00:00").toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short" }
  );

  let headline = "Your weekly wellness snapshot";
  let summary =
    "Keep taking regular wellness tests — we need a few check-ins to spot trends.";

  if (avgThisWeek != null && changeVsLastWeek != null) {
    if (changeVsLastWeek >= 5) {
      headline = "Strong week — your score is trending up";
      summary = `Your average this week is **${avgThisWeek}%**, up **${changeVsLastWeek} points** from last week. Whatever you changed — sleep, routine, or support — keep leaning into it.`;
    } else if (changeVsLastWeek <= -5) {
      headline = "A tougher week — be gentle with yourself";
      summary = `Your average this week is **${avgThisWeek}%**, down **${Math.abs(changeVsLastWeek)} points** from last week. Small steps count: one good night's sleep, a walk, or talking to someone you trust.`;
    } else {
      headline = "Steady week — holding your ground";
      summary = `Your average this week is **${avgThisWeek}%**, similar to last week. Consistency is a strength — review your insights for one small tweak to try.`;
    }
  } else if (avgThisWeek != null) {
    headline = "First weekly report";
    summary = `You averaged **${avgThisWeek}%** across **${thisWeek.length}** test${thisWeek.length === 1 ? "" : "s"} this week. Come back next week to see how you compare.`;
  }

  return {
    weekLabel,
    testsThisWeek: thisWeek.length,
    avgThisWeek,
    avgLastWeek,
    changeVsLastWeek,
    headline,
    summary,
  };
}

export interface YearImprovement {
  periodLabel: string;
  startScore: number;
  latestScore: number;
  changePoints: number;
  changePercent: number;
  message: string;
}

export function buildYearImprovement(checkIns: CheckIn[]): YearImprovement | null {
  if (checkIns.length < 2) return null;

  const sorted = [...checkIns].sort(
    (a, b) =>
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );
  const latest = sorted[sorted.length - 1];
  const oneYearAgo = Date.now() - 365 * 86400000;
  const inPeriod = sorted.filter(
    (c) => new Date(c.completedAt).getTime() >= oneYearAgo
  );
  if (inPeriod.length < 2) return null;

  const startScore = inPeriod[0].score;
  const latestScore = latest.score;
  const changePoints = latestScore - startScore;
  const changePercent =
    startScore === 0
      ? 0
      : Math.round((changePoints / startScore) * 100);

  let message: string;
  if (changePoints >= 10) {
    message = `Compared to your first test in the last year, you have improved by **${changePercent}%** (**+${changePoints} points**). That is real progress — notice what helped you get here.`;
  } else if (changePoints <= -10) {
    message = `Your score is **${Math.abs(changePercent)}%** lower than your starting point this year. That does not define you — use your 7-day plan below and reach out if you need support.`;
  } else {
    message = `Your score has stayed within **${Math.abs(changePoints)} points** of where you started this year. Small shifts add up — premium insights can help you find your next lever.`;
  }

  return {
    periodLabel: "Last 12 months",
    startScore,
    latestScore,
    changePoints,
    changePercent,
    message,
  };
}
