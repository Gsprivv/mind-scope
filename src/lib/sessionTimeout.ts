/** Sign out after this long away from the app or inactive (ms). */
export const SESSION_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;

export const SESSION_LAST_ACTIVE_KEY = "mind_scope_last_active_at";

export function readLastActiveAt(): number | null {
  const raw = localStorage.getItem(SESSION_LAST_ACTIVE_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function writeLastActiveAt(at = Date.now()): void {
  localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(at));
}

export function clearLastActiveAt(): void {
  localStorage.removeItem(SESSION_LAST_ACTIVE_KEY);
}

export function isSessionExpired(lastActiveAt: number | null): boolean {
  if (lastActiveAt == null) return false;
  return Date.now() - lastActiveAt > SESSION_TIMEOUT_MS;
}
