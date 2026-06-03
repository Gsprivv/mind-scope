import { InsightParagraph } from "../insights/InsightSection";
import { cardClass } from "../../lib/ui";
import type { WellnessImprovementPlan } from "../../lib/improvementPlans";
import type { DayPlan } from "../../lib/improvementPlans";

function DayCard({ day }: { day: DayPlan }) {
  return (
    <li className="rounded-xl border border-sage-200 p-4 dark:border-slate-700">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
        Day {day.day}
      </p>
      <h4 className="mt-1 font-semibold text-sage-900 dark:text-slate-100">
        {day.title}
      </h4>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-sage-700 dark:text-slate-300">
        {day.actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </li>
  );
}

export function WellnessImprovementPlanPanel({
  plan,
}: {
  plan: WellnessImprovementPlan;
}) {
  return (
    <section className={`p-6 ${cardClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
        7-day wellness plan
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-sage-900 dark:text-slate-100">
        Ways to improve your score
      </h2>
      <p className="mt-3 text-sm text-sage-700 dark:text-slate-300">
        {plan.reason}
      </p>
      <ul className="mt-6 space-y-3">
        {plan.days.map((day) => (
          <DayCard key={day.day} day={day} />
        ))}
      </ul>
    </section>
  );
}

export function BmiImprovementPlanPanel({
  reason,
  days,
}: {
  reason: string;
  days: DayPlan[];
}) {
  return (
    <section className={`mt-6 p-6 ${cardClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
        7-day BMI plan
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-sage-900 dark:text-slate-100">
        Your week-by-week guide
      </h2>
      <p className="mt-3 text-sm text-sage-700 dark:text-slate-300">
        <InsightParagraph text={reason} />
      </p>
      <ul className="mt-6 space-y-3">
        {days.map((day) => (
          <DayCard key={day.day} day={day} />
        ))}
      </ul>
    </section>
  );
}
