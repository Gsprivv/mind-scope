import type { User } from "../types";

export function isPremiumUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.isStaff) return true;
  if (user.subscriptionTier !== "premium") return false;
  if (!user.subscriptionExpiresAt) return false;
  return new Date(user.subscriptionExpiresAt).getTime() > Date.now();
}

export function formatPremiumExpiry(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function premiumPlanLabel(plan: User["subscriptionPlan"]): string {
  if (plan === "monthly") return "Monthly";
  if (plan === "yearly") return "Yearly";
  return "Premium";
}
