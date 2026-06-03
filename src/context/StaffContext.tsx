import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { STAFF_ACCESS_CODE } from "../constants/staff";

const STAFF_PROTECTED_PATH = /^\/staff\/(users|history)\/?$/;

interface StaffContextValue {
  isStaff: boolean;
  staffCode: string | null;
  unlock: (code: string) => boolean;
  lock: () => void;
}

const StaffContext = createContext<StaffContextValue | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isStaff, setIsStaff] = useState(false);
  const [staffCode, setStaffCode] = useState<string | null>(null);

  const lock = useCallback(() => {
    setIsStaff(false);
    setStaffCode(null);
  }, []);

  const unlock = useCallback((code: string) => {
    if (code.trim() !== STAFF_ACCESS_CODE) return false;
    setIsStaff(true);
    setStaffCode(code.trim());
    return true;
  }, []);

  /** Leave staff pages → session ends immediately (must enter code again). */
  useEffect(() => {
    if (!STAFF_PROTECTED_PATH.test(location.pathname)) {
      setIsStaff(false);
      setStaffCode(null);
    }
  }, [location.pathname]);

  const value = useMemo(
    () => ({ isStaff, staffCode, unlock, lock }),
    [isStaff, staffCode, unlock, lock]
  );

  return (
    <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
  );
}

export function useStaff(): StaffContextValue {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used within StaffProvider");
  return ctx;
}
