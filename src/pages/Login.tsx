import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IMAGES } from "../constants/brand";
import { useAuth } from "../context/AuthContext";
import { isLocked, MAX_LOGIN_ATTEMPTS } from "../lib/loginAttempts";
import { btnPrimaryClass, cardClass, inputClass } from "../lib/ui";

export function Login() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetPhone, setResetPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (email.trim()) {
      setLocked(isLocked(email));
      if (isLocked(email)) setShowReset(true);
    }
  }, [email]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
        return;
      }

      setError(result.error);
      setAttemptsLeft(result.attemptsLeft ?? null);
      setLocked(result.locked ?? false);
      if (result.locked) setShowReset(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const err = await resetPassword(email, resetPhone, newPassword);
    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    setResetSuccess(true);
    setLocked(false);
    setShowReset(false);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setResetPhone("");
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2 lg:items-center">
      <div className="hidden overflow-hidden rounded-2xl lg:block">
        <img
          src={IMAGES.calm}
          alt="Calm wellness environment"
          className="h-full min-h-[420px] w-full object-cover"
        />
      </div>

      <div>
        <h1 className="font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
          Welcome back
        </h1>
        <p className="mt-2 text-sage-600 dark:text-slate-400">
          Sign in to access your wellness check-ins and personal insights.
        </p>

        {!showReset ? (
          <form
            onSubmit={handleSubmit}
            method="post"
            action="/login"
            autoComplete="on"
            className={`mt-8 space-y-5 p-6 ${cardClass}`}
          >
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
                {error}
              </p>
            )}
            {attemptsLeft !== null && attemptsLeft > 0 && !error && (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {attemptsLeft} of {MAX_LOGIN_ATTEMPTS} login attempts remaining.
              </p>
            )}

            <label className="block" htmlFor="login-email">
              <span className="text-sm font-medium text-sage-700 dark:text-slate-300">Email</span>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="username email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block" htmlFor="login-password">
              <span className="text-sm font-medium text-sage-700 dark:text-slate-300">Password</span>
              <div className="relative mt-1">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  disabled={locked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-sage-600 hover:text-sage-800 dark:text-slate-400 dark:hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={locked}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button type="submit" disabled={submitting || locked} className={`w-full ${btnPrimaryClass}`}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            {locked && (
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="w-full text-sm font-medium text-teal-700 underline dark:text-teal-400"
              >
                Reset your password
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleReset} className={`mt-8 space-y-4 p-6 ${cardClass}`}>
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-slate-100">
              Reset password
            </h2>
            <p className="text-sm text-sage-600 dark:text-slate-400">
              Enter the email and telephone number registered on your account, then choose a new password.
            </p>

            {resetSuccess && (
              <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
                Password updated. You can sign in now.
              </p>
            )}
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
                {error}
              </p>
            )}

            <label className="block">
              <span className="text-sm font-medium text-sage-700 dark:text-slate-300">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-sage-700 dark:text-slate-300">Telephone number</span>
              <input
                type="tel"
                required
                value={resetPhone}
                onChange={(e) => setResetPhone(e.target.value)}
                placeholder="07XXX XXXXXX"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-sage-700 dark:text-slate-300">New password</span>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-sage-700 dark:text-slate-300">Confirm password</span>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </label>

            <button type="submit" disabled={submitting} className={`w-full ${btnPrimaryClass}`}>
              {submitting ? "Updating…" : "Update password"}
            </button>

            {!locked && (
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setError(null);
                }}
                className="w-full text-sm text-sage-600 dark:text-slate-400"
              >
                Back to sign in
              </button>
            )}
          </form>
        )}

        <p className="mt-6 text-center text-sm text-sage-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-teal-700 underline dark:text-teal-400">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
