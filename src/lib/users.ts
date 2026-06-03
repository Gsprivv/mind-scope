import type { AccountStatus, User } from "../types";
import { calculateAge } from "./age";

export function getDisplayName(user: User): string {
  return user.fullName || user.name || "Unknown";
}

export function getUserAge(user: User): number | null {
  return calculateAge(user.dateOfBirth);
}

export function normalizeUser(raw: User): User {
  return {
    ...raw,
    fullName: raw.fullName || raw.name || "",
    password: raw.password ?? "",
    dateOfBirth: raw.dateOfBirth ?? "",
    telephone: raw.telephone ?? "",
    city: raw.city ?? "",
    postcode: raw.postcode ?? "",
    status: raw.status ?? "active",
    statusChangedAt: raw.statusChangedAt ?? null,
    isStaff: raw.isStaff ?? false,
    subscriptionTier: raw.subscriptionTier ?? "free",
    subscriptionPlan: raw.subscriptionPlan ?? null,
    subscriptionStartedAt: raw.subscriptionStartedAt ?? null,
    subscriptionExpiresAt: raw.subscriptionExpiresAt ?? null,
  };
}

export function isAccountActive(user: User): boolean {
  return user.status === "active";
}

export function statusLabel(status: AccountStatus): string {
  return status === "active" ? "Active" : "Deactivated";
}
