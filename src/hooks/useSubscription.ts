import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  formatPremiumExpiry,
  isPremiumUser,
  premiumPlanLabel,
} from "../lib/subscription";
import { isSupabaseConfigured, requireSupabase } from "../lib/supabase";

export function useSubscription() {
  const { user } = useAuth();
  const [serverPremium, setServerPremium] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      setServerPremium(null);
      return;
    }

    let active = true;
    void requireSupabase()
      .rpc("get_my_premium_status")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setServerPremium(isPremiumUser(user));
          return;
        }
        setServerPremium(Boolean(data));
      });

    return () => {
      active = false;
    };
  }, [
    user?.id,
    user?.subscriptionTier,
    user?.subscriptionExpiresAt,
    user?.isStaff,
  ]);

  const isPremium =
    serverPremium !== null ? serverPremium : isPremiumUser(user);

  return {
    user,
    isPremium,
    premiumVerified: serverPremium !== null,
    tier: isPremium ? ("premium" as const) : ("free" as const),
    plan: user?.subscriptionPlan ?? null,
    planLabel: premiumPlanLabel(user?.subscriptionPlan ?? null),
    expiresAt: user?.subscriptionExpiresAt ?? null,
    expiresLabel: formatPremiumExpiry(user?.subscriptionExpiresAt ?? null),
  };
}
