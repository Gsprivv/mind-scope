export type RiskLevel = "low" | "average" | "high";

export function getRiskLevel(score: number): RiskLevel {
  if (score < 40) return "high";
  if (score < 65) return "average";
  return "low";
}

export function getRiskInfo(score: number): {
  level: RiskLevel;
  label: string;
  description: string;
  colorClass: string;
  chartColor: string;
} {
  const level = getRiskLevel(score);
  switch (level) {
    case "high":
      return {
        level,
        label: "High risk",
        description:
          "Your score suggests you may need extra support. Consider speaking with a counsellor, someone you trust, or your GP.",
        colorClass: "text-red-700 bg-red-50 border-red-200",
        chartColor: "#c53030",
      };
    case "average":
      return {
        level,
        label: "Average risk",
        description:
          "Some areas may feel challenging. Keep checking in and notice what helps you feel steadier.",
        colorClass: "text-amber-800 bg-amber-50 border-amber-200",
        chartColor: "#d97706",
      };
    case "low":
      return {
        level,
        label: "Low risk",
        description:
          "Your answers today suggest relatively stable wellness. Continue habits that support you.",
        colorClass: "text-sage-800 bg-sage-50 border-sage-200",
        chartColor: "#5a755a",
      };
  }
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low risk",
  average: "Average risk",
  high: "High risk",
};
