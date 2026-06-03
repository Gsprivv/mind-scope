import type { CheckIn, User } from "../types";
import { normalizeCheckIn } from "./historyStats";
import { normalizeUser } from "./users";

const USERS_KEY = "mindful_check_users";
const SESSION_KEY = "mindful_check_session";
const CHECKINS_KEY = "mindful_check_checkins";

export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? (JSON.parse(raw) as User[]) : [];
    return users.map(normalizeUser);
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionUserId(userId: string | null): void {
  if (userId) {
    localStorage.setItem(SESSION_KEY, userId);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getCheckIns(): CheckIn[] {
  try {
    const raw = localStorage.getItem(CHECKINS_KEY);
    const list = raw ? (JSON.parse(raw) as CheckIn[]) : [];
    return list.map(normalizeCheckIn);
  } catch {
    return [];
  }
}

export function saveCheckIns(checkIns: CheckIn[]): void {
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
}

export function getCheckInsForUser(userId: string): CheckIn[] {
  return getCheckIns()
    .filter((c) => c.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
