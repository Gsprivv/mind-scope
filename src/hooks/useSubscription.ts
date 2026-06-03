import { useAuth } from "../context/AuthContext";
import {
  formatPremiumExpiry,
  isPremiumUser,
  premiumPlanLabel,
} from "../lib/subscription";

export function useSubscription() {
  const { user } = useAuth();
  const isPremium = isPremiumUser(user);

  return {
    user,
    isPremium,
    tier: isPremium ? ("premium" as const) : ("free" as const),
    plan: user?.subscriptionPlan ?? null,
    planLabel: premiumPlanLabel(user?.subscriptionPlan ?? null),
    expiresAt: user?.subscriptionExpiresAt ?? null,
    expiresLabel: formatPremiumExpiry(user?.subscriptionExpiresAt ?? null),
  };
}
