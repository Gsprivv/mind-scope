import { Link } from "react-router-dom";
import { IMAGES } from "../constants/brand";
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
            {user.city}, {user.postcode} ·{" "}
            {loading
              ? "Loading check-ins…"
              : checkIns.length === 0
                ? "Start your first check-in"
                : `${checkIns.length} check-in${checkIns.length === 1 ? "" : "s"}`}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/check-in" className={btnPrimaryClass}>
              Take check-in
            </Link>
            <Link to="/history" className={btnSecondaryClass}>
              Insights &amp; charts
            </Link>
          <Link to="/journal" className={btnSecondaryClass}>
            Journal
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
          <p className="text-sm font-medium text-sage-500 dark:text-slate-400">Check-in streak</p>
          <p className="mt-1 font-display text-4xl font-semibold text-teal-700 dark:text-teal-400">
            {streak.current}
          </p>
          <p className="text-xs text-sage-500">Best: {streak.longest} days</p>
        </div>
        <div className={cardClass + " p-5"}>
          <p className="text-sm font-medium text-sage-500 dark:text-slate-400">Last check-in</p>
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
