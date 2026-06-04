import type { User } from "../../types";
import type { CheckIn } from "../../types";
import { buildWellnessInsights } from "../../lib/analytics";
import { getAppVisitStreak } from "../../lib/visitStreak";
import { InsightParagraph, InsightSection } from "./InsightSection";

export function WellnessInsightsPanel({
  checkIns,
  user,
}: {
  checkIns: CheckIn[];
  user: User | null;
}) {
  const insights = buildWellnessInsights(checkIns, user);
  if (!insights) return null;

  const visitStreak = user ? getAppVisitStreak(user.id) : { current: 0, longest: 0 };

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-5 dark:border-teal-900 dark:bg-teal-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">
            App visit streak
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-teal-900 dark:text-teal-100">
            {visitStreak.current} day{visitStreak.current === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-xs text-teal-700 dark:text-teal-400">
            Longest: {visitStreak.longest} day{visitStreak.longest === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl border border-sage-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/90 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-500 dark:text-slate-400">
            Pattern detection
          </p>
          <ul className="mt-2 space-y-2">
            {insights.patterns.map((p, i) => (
              <li key={i} className="text-sm text-sage-700 dark:text-slate-300">
                <InsightParagraph text={p} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {insights.crisisLevel !== "none" && (
        <InsightSection
          title="Support recommended"
          subtitle="Crisis detection — based on your latest check-in"
          variant="warning"
        >
          <ul className="list-inside list-disc space-y-2">
            {insights.crisisGuidance.map((line, i) => (
              <li key={i}>
                <InsightParagraph text={line} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">
            {insights.locationSupport}
          </p>
        </InsightSection>
      )}

      <InsightSection
        title="Mood timeline story"
        subtitle="Under your charts — your personal narrative"
      >
        <InsightParagraph text={insights.timelineStory} />
      </InsightSection>

      {insights.whyAnalysis && (
        <InsightSection
          title="Why am I feeling this way?"
          subtitle="Mind Scope analysis of your latest check-in"
        >
          <InsightParagraph text={insights.whyAnalysis} />
        </InsightSection>
      )}

      {insights.selfComparisons.length > 0 && (
        <InsightSection
          title="Compare yourself to yourself"
          subtitle="Not other people — your personal averages only"
        >
          <ul className="space-y-2">
            {insights.selfComparisons.slice(0, 5).map((c) => (
              <li
                key={c.questionId}
                className="flex flex-wrap justify-between gap-2 rounded-lg bg-sage-50 px-3 py-2 dark:bg-slate-800/80"
              >
                <span className="font-medium">{c.label}</span>
                <span
                  className={
                    c.percentVsSelf >= 0
                      ? "text-teal-700 dark:text-teal-400"
                      : "text-amber-700 dark:text-amber-400"
                  }
                >
                  {c.percentVsSelf >= 0 ? "+" : ""}
                  {c.percentVsSelf}% vs your average
                </span>
              </li>
            ))}
          </ul>
        </InsightSection>
      )}

      {insights.copingProfile && (
        <InsightSection
          title="Your coping profile"
          subtitle="AI-powered personality & coping insights over time"
        >
          <p className="mb-4 text-xs text-sage-500 dark:text-slate-500">
            {insights.copingProfile.summary}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-sage-800 dark:text-slate-200">
                What stresses you most
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                {insights.copingProfile.topStressors.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sage-800 dark:text-slate-200">
                What improves your mood
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                {insights.copingProfile.moodBoosters.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sage-800 dark:text-slate-200">
                Habits on better days
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                {insights.copingProfile.helpfulHabits.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </InsightSection>
      )}

      {insights.recovery && (
        <InsightSection
          title="Recovery outlook"
          subtitle="Personal estimate — use with caution"
          variant="estimate"
        >
          <InsightParagraph text={insights.recovery.text} />
          <p className="mt-3 rounded-lg bg-sage-50 px-3 py-2 text-xs text-sage-600 dark:bg-slate-800 dark:text-slate-400">
            ⚠ {insights.recovery.disclaimer}
          </p>
        </InsightSection>
      )}

      {insights.crisisLevel === "none" && (
        <p className="text-center text-xs text-sage-500 dark:text-slate-500">
          {insights.locationSupport}
        </p>
      )}
    </div>
  );
}
