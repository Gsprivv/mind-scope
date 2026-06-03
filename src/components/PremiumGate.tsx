import { Link } from "react-router-dom";
import {
  PREMIUM_MONTHLY_PRICE,
  PREMIUM_YEARLY_PRICE,
} from "../constants/premium";
import { btnPrimaryClass, cardClass } from "../lib/ui";

interface PremiumGateProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

export function PremiumGate({
  title = "Premium feature",
  description = "Upgrade to Mind Scope Premium for charts, insights, weekly reports, and personalised plans.",
  children,
  compact = false,
}: PremiumGateProps) {
  if (compact) {
    return (
      <div
        className={`rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-teal-50 p-4 dark:border-amber-900 dark:from-amber-950/40 dark:to-teal-950/30`}
      >
        <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
          {title}
        </p>
        <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-100/80">
          {description}
        </p>
        <Link to="/premium" className={`mt-3 inline-block ${btnPrimaryClass}`}>
          Upgrade from {PREMIUM_MONTHLY_PRICE}/mo
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden p-6 ${cardClass}`}>
      {children && (
        <div className="pointer-events-none select-none blur-sm opacity-40" aria-hidden>
          {children}
        </div>
      )}
      <div
        className={
          children
            ? "absolute inset-0 flex flex-col items-center justify-center bg-white/75 p-6 text-center dark:bg-slate-900/85"
            : "flex flex-col items-center text-center"
        }
      >
        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
          Premium
        </span>
        <h3 className="mt-3 font-display text-xl font-semibold text-sage-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-2 max-w-md text-sm text-sage-600 dark:text-slate-400">
          {description}
        </p>
        <p className="mt-2 text-sm font-medium text-teal-800 dark:text-teal-300">
          {PREMIUM_MONTHLY_PRICE}/month · {PREMIUM_YEARLY_PRICE}/year
        </p>
        <Link to="/premium" className={`mt-4 ${btnPrimaryClass}`}>
          View Premium plans
        </Link>
      </div>
    </div>
  );
}

export function PremiumBadge() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
      Premium
    </span>
  );
}
