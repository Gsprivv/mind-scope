import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IMAGES,
  STREAK_LABEL,
  WELLNESS_TEST_ACTION,
  wellnessTestCountLabel,
} from "../constants/brand";
import { PremiumGate } from "../components/PremiumGate";
import { WeeklyReportCard } from "../components/premium/PremiumReports";
import { useAuth } from "../context/AuthContext";
import { useCheckIns } from "../context/CheckInsContext";
import { useSubscription } from "../hooks/useSubscription";
import { useVisitStreak } from "../hooks/useVisitStreak";
import { buildWellnessInsights } from "../lib/analytics";
import { formatDateUK } from "../lib/formatDate";
import { buildWeeklyReport } from "../lib/premiumReports";
import { getRiskInfo } from "../lib/risk";
import { getDisplayName } from "../lib/users";
import { btnPrimaryClass, btnSecondaryClass, cardClass } from "../lib/ui";

export function Dashboard() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { checkIns, loading, reload } = useCheckIns();
  const visitStreak = useVisitStreak(user?.id);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      void reload();
    }
  }, [location.pathname, reload]);

  if (!user) return null;

  const latest = checkIns[0];
  const latestRisk = latest ? getRiskInfo(latest.score) : null;
  const insights = isPremium && latest ? buildWellnessInsights(checkIns, user) : null;
  const weeklyReport = isPremium ? buildWeeklyReport(checkIns) : null;

  const insightTeaser =
    insights?.whyAnalysis ??
    insights?.patterns[0] ??
    insights?.timelineStory ??
    null;

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
            Hello, {getDisplayName(user).split(" ")[0]}
          </h1>
          <p className="mt-1 text-sage-600 dark:text-slate-400">
            {user.city}, {user.postcode}
            {!loading && (
              <>
                {" "}
                · {wellnessTestCountLabel(isPremium ? checkIns.length : latest ? 1 : 0)}
              </>
            )}
            {loading && <> · Loading…</>}
          </p>

          {checkIns.length === 0 && !loading && (
            <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100">
              Welcome! When you are ready, tap <strong>{WELLNESS_TEST_ACTION}</strong>{" "}
              to complete your wellbeing questionnaire and get your score.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/check-in" className={btnPrimaryClass}>
              {WELLNESS_TEST_ACTION}
            </Link>
            <Link to="/history" className={btnSecondaryClass}>
              {isPremium ? "Insights & charts" : "Full history (Premium)"}
            </Link>
            <Link to="/journal" className={btnSecondaryClass}>
              Journal
            </Link>
            <Link to="/bmi" className={btnSecondaryClass}>
              BMI &amp; nutrition
            </Link>
            <Link to="/account" className={btnSecondaryClass}>
              Account
            </Link>
            {!isPremium && (
              <Link to="/premium" className={btnSecondaryClass}>
                Upgrade
              </Link>
            )}
          </div>
        </div>
        <div className="hidden overflow-hidden rounded-2xl lg:block">
          <img
            src={IMAGES.wellness}
            alt="Wellness"
            className="h-40 w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cardClass + " p-5"}>
          <p className="text-sm font-medium text-sage-500 dark:text-slate-400">Latest score</p>
          <p className="mt-1 font-display text-4xl font-semibold text-sage-800 dark:text-slate-100">
            {latest ? `${latest.score}%` : "—"}
          </p>
        </div>
        <div className={cardClass + " p-5"}>
          <p className="text-sm font-medium text-sage-500 dark:text-slate-400">Latest risk</p>
          <p className="mt-2 text-lg font-semibold text-sage-800 dark:text-slate-100">
            {latestRisk ? latestRisk.label : "—"}
          </p>
        </div>
        <div className={cardClass + " p-5"}>
          <p className="text-sm font-medium text-sage-500 dark:text-slate-400">
            {STREAK_LABEL}
          </p>
          <p className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold text-teal-700 dark:text-teal-400">
            {visitStreak.current > 0 && (
              <span className="text-3xl leading-none" aria-hidden>
                🔥
              </span>
            )}
            <span>{visitStreak.current}</span>
          </p>
          <p className="text-xs text-sage-500 dark:text-slate-400">
            Days you opened Mind Scope
            {visitStreak.longest > 0 && (
              <>
                {" "}
                · best {visitStreak.longest} day{visitStreak.longest === 1 ? "" : "s"}
              </>
            )}
          </p>
        </div>
        <div className={cardClass + " p-5"}>
          <p className="text-sm font-medium text-sage-500 dark:text-slate-400">
            Last wellness test
          </p>
          <p className="mt-2 text-lg font-medium text-sage-800 dark:text-slate-100">
            {latest ? formatDateUK(latest.completedAt) : "None"}
          </p>
        </div>
      </div>

      {latestRisk && latest && (
        <p className={`mt-6 rounded-2xl border px-5 py-4 ${latestRisk.colorClass}`}>
          {latestRisk.description}
        </p>
      )}

      {!isPremium && latest && (
        <div className="mt-6">
          <PremiumGate
            compact
            title="Want insights, charts & BMI tips?"
            description="Your latest score is above. Upgrade to Premium for full history, personalised advice, weekly reports, and nutrition guides."
          />
        </div>
      )}

      {isPremium && weeklyReport && (
        <div className="mt-6">
          <WeeklyReportCard report={weeklyReport} />
        </div>
      )}

      {isPremium && insightTeaser && (
        <div className={`mt-6 p-5 ${cardClass}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
            Mind Scope insight
          </p>
          <p className="mt-2 text-sm text-sage-700 dark:text-slate-300">
            {insightTeaser.replace(/\*\*/g, "")}
          </p>
          <Link
            to="/history"
            className="mt-3 inline-block text-sm font-medium text-teal-700 underline dark:text-teal-400"
          >
            View full analytics →
          </Link>
        </div>
      )}

      {isPremium && latest && !insightTeaser && (
        <div className={`mt-6 p-5 ${cardClass}`}>
          <p className="text-sm text-sage-600 dark:text-slate-400">
            Take a few more wellness tests to unlock deeper pattern insights on your{" "}
            <Link to="/history" className="font-medium text-teal-700 underline dark:text-teal-400">
              history page
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
