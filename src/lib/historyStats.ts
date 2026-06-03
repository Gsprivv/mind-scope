import type { CheckIn } from "../types";
import { getRiskLevel } from "./risk";

export interface RiskPercentages {
  low: number;
  average: number;
  high: number;
  counts: { low: number; average: number; high: number };
}

export function computeRiskPercentages(checkIns: CheckIn[]): RiskPercentages {
  const counts = { low: 0, average: 0, high: 0 };
  if (checkIns.length === 0) {
    return { low: 0, average: 0, high: 0, counts };
  }

  for (const c of checkIns) {
    const level = c.riskLevel ?? getRiskLevel(c.score);
    counts[level] += 1;
  }

  const total = checkIns.length;
  return {
    low: Math.round((counts.low / total) * 100),
    average: Math.round((counts.average / total) * 100),
    high: Math.round((counts.high / total) * 100),
    counts,
  };
}

export function getTrendMessage(checkIns: CheckIn[]): string {
  const sorted = [...checkIns].sort(
    (a, b) =>
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );
  if (sorted.length < 2) {
    return "Complete more check-ins to see whether your wellness is improving over time.";
  }

  const firstHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
  const secondHalf = sorted.slice(Math.ceil(sorted.length / 2));
  const avg = (arr: CheckIn[]) =>
    arr.reduce((s, c) => s + c.score, 0) / arr.length;
  const diff = avg(secondHalf) - avg(firstHalf);

  if (diff >= 8) {
    return "Your scores are trending upward — your mental wellness appears to be improving.";
  }
  if (diff <= -8) {
    return "Your scores have declined recently. Consider extra self-care or speaking with support.";
  }
  return "Your scores are fairly stable. Keep checking in to spot longer-term patterns.";
}

export function normalizeCheckIn(raw: CheckIn): CheckIn {
  return {
    ...raw,
    riskLevel: raw.riskLevel ?? getRiskLevel(raw.score),
    sleepHours: raw.sleepHours ?? null,
  };
}
