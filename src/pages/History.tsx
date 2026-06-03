import { Link } from "react-router-dom";
import { WELLNESS_TEST_ACTION } from "../constants/brand";
import { RiskPieChart } from "../components/charts/RiskPieChart";
import { ScoreLineChart } from "../components/charts/ScoreLineChart";
import { PremiumGate } from "../components/PremiumGate";
import { WellnessImprovementPlanPanel } from "../components/premium/ImprovementPlans";
import {
  WeeklyReportCard,
  YearImprovementCard,
} from "../components/premium/PremiumReports";
import { WellnessInsightsPanel } from "../components/insights/WellnessInsightsPanel";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import { useUserCheckIns } from "../hooks/useUserCheckIns";
import { buildWellnessImprovementPlan } from "../lib/improvementPlans";
import { computeRiskPercentages, getTrendMessage } from "../lib/historyStats";
import { formatDateUK } from "../lib/formatDate";
import {
  buildWeeklyReport,
  buildYearImprovement,
} from "../lib/premiumReports";
import { getRiskInfo, RISK_LABELS } from "../lib/risk";
import { btnPrimaryClass, btnSecondaryClass, cardClass } from "../lib/ui";

export function History() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { checkIns } = useUserCheckIns(user?.id);
  if (!user) return null;
  const riskData = computeRiskPercentages(checkIns);
  const trend = getTrendMessage(checkIns);
  const weeklyReport = buildWeeklyReport(checkIns);
  const yearImprovement = buildYearImprovement(checkIns);
  const improvementPlan = buildWellnessImprovementPlan(checkIns);
  const displayCheckIns = isPremium ? checkIns : checkIns.slice(0, 1);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
            {isPremium ? "Insights & history" : "Your latest test"}
          </h1>
          <p className="mt-1 text-sage-600 dark:text-slate-400">
            {isPremium
              ? "Analytics, patterns, and charts — private to your account."
              : "Basic accounts see their most recent result. Upgrade for full history and analytics."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isPremium && (
            <Link to="/premium" className={btnPrimaryClass}>
              Upgrade to Premium
            </Link>
          )}
          <Link to="/journal" className={btnSecondaryClass}>
            Journal
          </Link>
          <Link to="/check-in" className={btnSecondaryClass}>
            {WELLNESS_TEST_ACTION}
          </Link>
        </div>
      </div>

      {checkIns.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-sage-300 bg-sage-50/50 px-5 py-12 text-center text-sage-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
          No wellness tests yet.{" "}
          <Link to="/check-in" className="font-medium text-teal-700 underline dark:text-teal-400">
            Take your first assessment
          </Link>
          .
        </p>
      ) : (
        <>
          {isPremium ? (
            <>
              {weeklyReport && (
                <div className="mt-8">
                  <WeeklyReportCard report={weeklyReport} />
                </div>
              )}

              {yearImprovement && (
                <div className="mt-8">
                  <YearImprovementCard data={yearImprovement} />
                </div>
              )}

              <section className={`mt-8 p-6 ${cardClass}`}>
                <h2 className="font-display text-xl font-semibold text-sage-800 dark:text-slate-100">
                  Risk breakdown
                </h2>
                <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">
                  Percentage of check-ins at each risk level
                </p>
                <div className="mt-6">
                  <RiskPieChart data={riskData} />
                </div>
              </section>

              <section className={`mt-8 p-6 ${cardClass}`}>
                <h2 className="font-display text-xl font-semibold text-sage-800 dark:text-slate-100">
                  Wellness over time
                </h2>
                <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">{trend}</p>
                <div className="mt-6">
                  <ScoreLineChart checkIns={checkIns} />
                </div>
              </section>

              <WellnessInsightsPanel checkIns={checkIns} user={user} />

              {improvementPlan && (
                <div className="mt-8">
                  <WellnessImprovementPlanPanel plan={improvementPlan} />
                </div>
              )}

              <section className="mt-8">
                <h2 className="font-display text-xl font-semibold text-sage-800 dark:text-slate-100">
                  All check-ins
                </h2>
                <ul className="mt-4 space-y-3">
                  {checkIns.map((c) => {
                    const risk = getRiskInfo(c.score);
                    return (
                      <li
                        key={c.id}
                        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${cardClass}`}
                      >
                        <div>
                          <p className="font-medium text-sage-800 dark:text-slate-100">
                            {formatDateUK(c.completedAt)}
                          </p>
                          <p className="text-sm text-sage-500 dark:text-slate-400">
                            {RISK_LABELS[risk.level]} · Score {c.score}%
                            {c.sleepHours != null && ` · ${c.sleepHours}h sleep`}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-sm font-medium ${risk.colorClass}`}
                        >
                          {risk.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          ) : (
            <>
              <section className="mt-8">
                <h2 className="font-display text-xl font-semibold text-sage-800 dark:text-slate-100">
                  Latest check-in
                </h2>
                <ul className="mt-4 space-y-3">
                  {displayCheckIns.map((c) => {
                    const risk = getRiskInfo(c.score);
                    return (
                      <li
                        key={c.id}
                        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${cardClass}`}
                      >
                        <div>
                          <p className="font-medium text-sage-800 dark:text-slate-100">
                            {formatDateUK(c.completedAt)}
                          </p>
                          <p className="text-sm text-sage-500 dark:text-slate-400">
                            {RISK_LABELS[risk.level]} · Score {c.score}%
                            {c.sleepHours != null && ` · ${c.sleepHours}h sleep`}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-sm font-medium ${risk.colorClass}`}
                        >
                          {risk.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <div className="mt-8">
                <PremiumGate title="Unlock charts & insights" />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
