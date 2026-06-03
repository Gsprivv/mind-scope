import type { User } from "../types";
import { deleteJournalEntriesForUser } from "./journalStorage";
import {
  getCheckIns,
  getUsers,
  saveCheckIns,
  saveUsers,
} from "./storage";
import { normalizeUser } from "./users";

function updateUser(
  userId: string,
  patch: Partial<Pick<User, "status" | "statusChangedAt">>
): User | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const updated: User = {
    ...users[idx],
    ...patch,
    statusChangedAt: new Date().toISOString(),
  };
  const next = [...users];
  next[idx] = updated;
  saveUsers(next);
  return normalizeUser(updated);
}

export function deactivateUserAccount(userId: string): User | null {
  return updateUser(userId, { status: "deactivated" });
}

export function activateUserAccount(userId: string): User | null {
  return updateUser(userId, { status: "active" });
}

/** Permanently removes user and all their check-ins and journal entries. */
export function deleteUserAccount(userId: string): boolean {
  const users = getUsers();
  const exists = users.some((u) => u.id === userId);
  if (!exists) return false;

  saveUsers(users.filter((u) => u.id !== userId));
  saveCheckIns(getCheckIns().filter((c) => c.userId !== userId));
  deleteJournalEntriesForUser(userId);
  return true;
}

export function findUserByEmail(email: string): User | undefined {
  const trimmed = email.trim().toLowerCase();
  return getUsers().find((u) => u.email === trimmed);
}
