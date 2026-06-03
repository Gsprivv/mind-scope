import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SignUpInput, User } from "../types";
import {
  deactivateOwnAccount,
  deleteOwnAccount,
  fetchProfileById,
  getAccountStatus,
  resetPasswordWithPhone,
} from "../lib/db/profiles";
import { calculateAge } from "../lib/age";
import {
  clearAttempts,
  incrementAttempts,
  isLocked,
  MAX_LOGIN_ATTEMPTS,
} from "../lib/loginAttempts";
import { isAccountActive, normalizeUser } from "../lib/users";
import { isSupabaseConfigured, requireSupabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import type { AuthChangeEvent } from "@supabase/supabase-js";

export type LoginResult =
  | { success: true }
  | {
      success: false;
      error: string;
      attemptsLeft?: number;
      locked?: boolean;
    };

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<string | null>;
  login: (email: string, password: string) => Promise<LoginResult>;
  resetPassword: (
    email: string,
    telephone: string,
    newPassword: string
  ) => Promise<string | null>;
  deactivateMyAccount: () => Promise<string | null>;
  deleteMyAccount: () => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadUserFromSession(): Promise<User | null> {
  const client = requireSupabase();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session?.user) return null;

  const profile = await fetchProfileById(session.user.id);
  if (!profile || !isAccountActive(profile)) {
    await client.auth.signOut();
    return null;
  }
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      return;
    }
    try {
      const profile = await loadUserFromSession();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const client = requireSupabase();
    let active = true;

    loadUserFromSession()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (!active) return;
      if (!session?.user) {
        setUser(null);
        return;
      }
      try {
        const profile = await fetchProfileById(session.user.id);
        if (!profile || !isAccountActive(profile)) {
          await client.auth.signOut();
          setUser(null);
          return;
        }
        setUser(profile);
      } catch {
        setUser(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    if (!isSupabaseConfigured()) {
      return "Cloud database is not configured. Contact the site administrator.";
    }

    const fullName = input.fullName.trim();
    const trimmedEmail = input.email.trim().toLowerCase();
    const telephone = input.telephone.trim();

    if (!fullName) return "Please enter your full name.";
    if (!trimmedEmail.includes("@")) return "Please enter a valid email.";
    if (input.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (!input.dateOfBirth) return "Please enter your date of birth.";
    const age = calculateAge(input.dateOfBirth);
    if (age === null || age < 13) {
      return "You must be at least 13 years old to sign up.";
    }
    if (!telephone) return "Please enter your telephone number.";
    const city = input.city.trim();
    const postcode = input.postcode.trim().toUpperCase();
    if (!city) return "Please enter your city or town.";
    if (!postcode || postcode.length < 5) {
      return "Please enter a valid UK postcode.";
    }

    const existingStatus = await getAccountStatus(trimmedEmail);
    if (existingStatus === "deactivated") {
      return "An account with this email exists but is deactivated. Contact support to reactivate it.";
    }
    if (existingStatus === "active") {
      return "An account with this email already exists.";
    }

    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email: trimmedEmail,
      password: input.password,
      options: {
        data: {
          full_name: fullName,
          date_of_birth: input.dateOfBirth,
          telephone,
          city,
          postcode,
        },
      },
    });

    if (error) return error.message;
    if (!data.user) return "Sign up failed. Please try again.";

    const profile = await fetchProfileById(data.user.id);
    if (profile) {
      setUser(profile);
      return null;
    }

    return "Account created but profile is still syncing. Please sign in.";
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      if (!isSupabaseConfigured()) {
        return {
          success: false,
          error: "Cloud database is not configured. Contact the site administrator.",
        };
      }

      const trimmedEmail = email.trim().toLowerCase();

      if (isLocked(trimmedEmail)) {
        return {
          success: false,
          error: "Too many failed attempts. Please reset your password below.",
          locked: true,
          attemptsLeft: 0,
        };
      }

      const accountStatus = await getAccountStatus(trimmedEmail);
      if (!accountStatus) {
        return {
          success: false,
          error: "No account found with this email address.",
        };
      }

      if (accountStatus === "deactivated") {
        return {
          success: false,
          error:
            "This account has been deactivated. Contact support if you need it reactivated.",
        };
      }

      const client = requireSupabase();
      const { data, error } = await client.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const attempts = incrementAttempts(trimmedEmail);
        const left = MAX_LOGIN_ATTEMPTS - attempts;
        if (left <= 0) {
          return {
            success: false,
            error: "Too many failed attempts. Please reset your password below.",
            locked: true,
            attemptsLeft: 0,
          };
        }
        return {
          success: false,
          error: `Incorrect password. ${left} attempt${left === 1 ? "" : "s"} remaining.`,
          attemptsLeft: left,
        };
      }

      clearAttempts(trimmedEmail);
      const profile = await fetchProfileById(data.user.id);
      if (!profile) {
        return { success: false, error: "Could not load your profile." };
      }
      setUser(normalizeUser(profile));
      return { success: true };
    },
    []
  );

  const resetPassword = useCallback(
    async (email: string, telephone: string, newPassword: string) => {
      if (!isSupabaseConfigured()) {
        return "Cloud database is not configured.";
      }

      if (newPassword.length < 6) {
        return "Password must be at least 6 characters.";
      }

      const trimmedEmail = email.trim().toLowerCase();
      const accountStatus = await getAccountStatus(trimmedEmail);

      if (!accountStatus) {
        return "No account found with this email address.";
      }

      if (accountStatus === "deactivated") {
        return "This account is deactivated. Contact support to reactivate it first.";
      }

      const errorMessage = await resetPasswordWithPhone(
        trimmedEmail,
        telephone,
        newPassword
      );
      if (errorMessage) return errorMessage;

      clearAttempts(trimmedEmail);
      return null;
    },
    []
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await requireSupabase().auth.signOut();
    }
    setUser(null);
  }, []);

  const deactivateMyAccount = useCallback(async () => {
    if (!user) return "Not signed in.";
    try {
      await deactivateOwnAccount();
      await requireSupabase().auth.signOut();
      setUser(null);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Could not deactivate account.";
    }
  }, [user]);

  const deleteMyAccount = useCallback(async () => {
    if (!user) return "Not signed in.";
    try {
      await deleteOwnAccount();
      setUser(null);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Could not delete account.";
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      signUp,
      login,
      resetPassword,
      deactivateMyAccount,
      deleteMyAccount,
      logout,
      refreshUser,
    }),
    [
      user,
      loading,
      signUp,
      login,
      resetPassword,
      deactivateMyAccount,
      deleteMyAccount,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
