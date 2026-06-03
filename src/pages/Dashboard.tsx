import { Link } from "react-router-dom";
import {
  IMAGES,
  STREAK_LABEL,
  WELLNESS_TEST_ACTION,
  wellnessTestCountLabel,
} from "../constants/brand";
import { useAuth } from "../context/AuthContext";
import { useUserCheckIns } from "../hooks/useUserCheckIns";
import { buildWellnessInsights, computeStreak } from "../lib/analytics";
import { formatDateUK } from "../lib/formatDate";
import { getRiskInfo } from "../lib/risk";
import { getDisplayName } from "../lib/users";
import { btnPrimaryClass, btnSecondaryClass, cardClass } from "../lib/ui";

export function Dashboard() {
  const { user } = useAuth();
  const { checkIns, loading } = useUserCheckIns(user?.id);
  if (!user) return null;
  const latest = checkIns[0];
  const latestRisk = latest ? getRiskInfo(latest.score) : null;
  const streak = computeStreak(checkIns);
  const insights = buildWellnessInsights(checkIns, user);

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
              <> · {wellnessTestCountLabel(checkIns.length)}</>
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
              Insights &amp; charts
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
            {streak.current > 0 && (
              <span className="text-3xl leading-none" aria-hidden>
                🔥
              </span>
            )}
            <span>{streak.current}</span>
          </p>
          <p className="text-xs text-sage-500 dark:text-slate-400">
            {streak.longest > 0 && <span aria-hidden>🔥 </span>}
            Best: {streak.longest} day{streak.longest === 1 ? "" : "s"}
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

      {insights && insights.patterns[0] && (
        <div className={`mt-6 p-5 ${cardClass}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
            Mind Scope insight
          </p>
          <p className="mt-2 text-sm text-sage-700 dark:text-slate-300">
            {insights.patterns[0].replace(/\*\*/g, "")}
          </p>
          <Link
            to="/history"
            className="mt-3 inline-block text-sm font-medium text-teal-700 underline dark:text-teal-400"
          >
            View full analytics →
          </Link>
        </div>
      )}
    </div>
  );
}
