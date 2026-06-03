import { InsightParagraph } from "../insights/InsightSection";
import { cardClass } from "../../lib/ui";
import type { WeeklyReport, YearImprovement } from "../../lib/premiumReports";

export function WeeklyReportCard({ report }: { report: WeeklyReport }) {
  return (
    <section className={`p-6 ${cardClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
        Weekly report · w/c {report.weekLabel}
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-sage-900 dark:text-slate-100">
        {report.headline}
      </h2>
      <p className="mt-3 text-sm text-sage-700 dark:text-slate-300">
        <InsightParagraph text={report.summary} />
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-sage-50 px-3 py-2 dark:bg-slate-800/60">
          <dt className="text-xs text-sage-500">Tests this week</dt>
          <dd className="font-semibold text-sage-900 dark:text-slate-100">
            {report.testsThisWeek}
          </dd>
        </div>
        <div className="rounded-xl bg-sage-50 px-3 py-2 dark:bg-slate-800/60">
          <dt className="text-xs text-sage-500">Avg score</dt>
          <dd className="font-semibold text-sage-900 dark:text-slate-100">
            {report.avgThisWeek != null ? `${report.avgThisWeek}%` : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-sage-50 px-3 py-2 dark:bg-slate-800/60">
          <dt className="text-xs text-sage-500">Vs last week</dt>
          <dd className="font-semibold text-sage-900 dark:text-slate-100">
            {report.changeVsLastWeek != null
              ? `${report.changeVsLastWeek >= 0 ? "+" : ""}${report.changeVsLastWeek} pts`
              : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function YearImprovementCard({ data }: { data: YearImprovement }) {
  const positive = data.changePoints >= 0;
  return (
    <section className={`p-6 ${cardClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
        {data.periodLabel}
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-sage-900 dark:text-slate-100">
        {positive ? "Your progress this year" : "Room to grow"}
      </h2>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <p className="text-xs text-sage-500">Then</p>
          <p className="font-display text-3xl font-semibold text-sage-700 dark:text-slate-300">
            {data.startScore}%
          </p>
        </div>
        <p className="text-2xl text-sage-400">→</p>
        <div>
          <p className="text-xs text-sage-500">Now</p>
          <p className="font-display text-3xl font-semibold text-teal-700 dark:text-teal-400">
            {data.latestScore}%
          </p>
        </div>
        <p
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            positive
              ? "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200"
              : "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
          }`}
        >
          {positive ? "+" : ""}
          {data.changePercent}% ({data.changePoints >= 0 ? "+" : ""}
          {data.changePoints} pts)
        </p>
      </div>
      <p className="mt-4 text-sm text-sage-700 dark:text-slate-300">
        <InsightParagraph text={data.message} />
      </p>
    </section>
  );
}
