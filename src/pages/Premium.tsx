import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FREE_FEATURES,
  PREMIUM_FEATURES,
  PREMIUM_MONTHLY_PRICE,
  PREMIUM_YEARLY_PRICE,
  type SubscriptionPlan,
} from "../constants/premium";
import { PremiumBadge } from "../components/PremiumGate";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import { startPremiumCheckout } from "../lib/db/subscription";
import { btnPrimaryClass, btnSecondaryClass, cardClass } from "../lib/ui";

export function Premium() {
  const { refreshUser } = useAuth();
  const { isPremium, planLabel, expiresLabel } = useSubscription();
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState<SubscriptionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      void refreshUser().then(() => {
        setSuccess("Payment received — Premium is now active on your account.");
      });
    }
  }, [searchParams, refreshUser]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setBusy(plan);
    setError(null);
    const result = await startPremiumCheckout(plan);
    setBusy(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) {
      window.location.href = result.url;
      return;
    }
    await refreshUser();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
        Mind Scope Premium
      </h1>
      <p className="mt-2 text-sage-600 dark:text-slate-400">
        Unlock charts, deep insights, weekly reports, and personalised 7-day
        improvement plans for wellness and BMI.
      </p>

      {isPremium && (
        <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100">
          You have <PremiumBadge /> active
          {planLabel && <> ({planLabel})</>}
          {expiresLabel && <> · renews/expires {expiresLabel}</>}.
          <Link to="/history" className="ml-1 font-medium underline">
            Open insights →
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className={`p-6 ${cardClass}`}>
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-slate-100">
            Basic — free
          </h2>
          <p className="mt-1 text-2xl font-bold text-sage-800 dark:text-slate-200">
            £0
          </p>
          <ul className="mt-4 space-y-2 text-sm text-sage-700 dark:text-slate-300">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-teal-600">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`relative p-6 ring-2 ring-teal-500/30 ${cardClass}`}
        >
          <span className="absolute -top-3 right-4 rounded-full bg-teal-600 px-3 py-0.5 text-xs font-bold text-white">
            Best value
          </span>
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-slate-100">
            Premium
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-sage-700 dark:text-slate-300">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-teal-600">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {!isPremium && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className={`p-6 ${cardClass}`}>
            <p className="text-sm font-medium text-sage-500">Monthly</p>
            <p className="mt-1 font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
              {PREMIUM_MONTHLY_PRICE}
              <span className="text-base font-normal text-sage-500">/mo</span>
            </p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => handleSubscribe("monthly")}
              className={`mt-4 w-full ${btnPrimaryClass}`}
            >
              {busy === "monthly" ? "Redirecting…" : "Subscribe monthly"}
            </button>
          </div>
          <div className={`p-6 ${cardClass}`}>
            <p className="text-sm font-medium text-sage-500">Yearly</p>
            <p className="mt-1 font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
              {PREMIUM_YEARLY_PRICE}
              <span className="text-base font-normal text-sage-500">/yr</span>
            </p>
            <p className="mt-1 text-xs text-teal-700 dark:text-teal-400">
              Save vs 12 × monthly
            </p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => handleSubscribe("yearly")}
              className={`mt-4 w-full ${btnPrimaryClass}`}
            >
              {busy === "yearly" ? "Redirecting…" : "Subscribe yearly"}
            </button>
          </div>
        </div>
      )}

      {success && (
        <p className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
          {success}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-sage-500 dark:text-slate-400">
        Payments are processed securely via Stripe. Cancel anytime from your
        email receipt or contact support.
      </p>
      <p className="mt-4 text-center text-sm">
        <Link to="/dashboard" className={btnSecondaryClass}>
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
