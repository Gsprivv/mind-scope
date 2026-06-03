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
  };
}

export function isAccountActive(user: User): boolean {
  return user.status === "active";
}

export function statusLabel(status: AccountStatus): string {
  return status === "active" ? "Active" : "Deactivated";
}
