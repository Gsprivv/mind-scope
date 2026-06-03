import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

/** True when the signed-in user is an active staff member. */
export function useStaff(): { isStaff: boolean } {
  const { user } = useAuth();
  return { isStaff: Boolean(user?.isStaff) };
}

/** @deprecated StaffProvider no longer required; kept for app tree compatibility. */
export function StaffProvider({ children }: { children: ReactNode }) {
  return children;
}
