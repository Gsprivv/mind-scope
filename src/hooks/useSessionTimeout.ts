import { useEffect, useRef } from "react";
import {
  clearLastActiveAt,
  isSessionExpired,
  readLastActiveAt,
  writeLastActiveAt,
} from "../lib/sessionTimeout";

const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
] as const;

const CHECK_INTERVAL_MS = 30_000;
const ACTIVITY_THROTTLE_MS = 15_000;

/**
 * Logs the user out after 8 minutes away from the app or without activity.
 * Persists last-active time so closing/reopening the PWA still enforces the limit.
 */
export function useSessionTimeout(
  isSignedIn: boolean,
  logout: () => Promise<void>
) {
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    if (!isSignedIn) {
      clearLastActiveAt();
      return;
    }

    let lastTouch = 0;

    const expireIfNeeded = () => {
      if (isSessionExpired(readLastActiveAt())) {
        clearLastActiveAt();
        void logoutRef.current();
        return true;
      }
      return false;
    };

    const touchActivity = () => {
      const now = Date.now();
      if (now - lastTouch < ACTIVITY_THROTTLE_MS) return;
      lastTouch = now;
      writeLastActiveAt(now);
    };

    const onLeave = () => {
      writeLastActiveAt();
    };

    const onReturn = () => {
      if (expireIfNeeded()) return;
      touchActivity();
    };

    writeLastActiveAt();
    if (expireIfNeeded()) return;

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, touchActivity, { passive: true });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onLeave();
      else onReturn();
    });

    window.addEventListener("pagehide", onLeave);
    window.addEventListener("pageshow", onReturn);
    window.addEventListener("focus", onReturn);

    const interval = window.setInterval(expireIfNeeded, CHECK_INTERVAL_MS);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, touchActivity);
      }
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("pageshow", onReturn);
      window.removeEventListener("focus", onReturn);
      window.clearInterval(interval);
    };
  }, [isSignedIn]);
}
