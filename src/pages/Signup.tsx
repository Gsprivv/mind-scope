import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { calculateAge } from "../lib/age";
import { inputClass, btnPrimaryClass, cardClass } from "../lib/ui";

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [telephone, setTelephone] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const age = useMemo(
    () => (dateOfBirth ? calculateAge(dateOfBirth) : null),
    [dateOfBirth]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const err = await signUp({
        fullName,
        email,
        password,
        dateOfBirth,
        telephone,
        city,
        postcode,
      });
      if (err) {
        setError(err);
        return;
      }
      navigate("/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
        Create your account
      </h1>
      <p className="mt-2 text-sage-600 dark:text-slate-400">
        Your location helps Mind Scope signpost UK support near you when needed.
      </p>

      <form
        onSubmit={handleSubmit}
        method="post"
        action="/signup"
        autoComplete="on"
        className={`mt-8 space-y-4 p-6 ${cardClass}`}
      >
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        <label className="block">
          <span className="text-sm font-medium text-sage-700">Full name</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block" htmlFor="signup-email">
          <span className="text-sm font-medium text-sage-700">Email</span>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block" htmlFor="signup-password">
          <span className="text-sm font-medium text-sage-700 dark:text-slate-300">Password</span>
          <div className="relative mt-1">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-sage-600 hover:text-sage-800 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <span className="mt-1 block text-xs text-sage-500 dark:text-slate-400">
            At least 6 characters
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-sage-700">
            Date of birth
          </span>
          <input
            type="date"
            required
            value={dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="block rounded-lg bg-sage-50 px-3 py-2.5">
          <span className="text-sm font-medium text-sage-700">Age</span>
          <p className="mt-0.5 text-sage-800">
            {age !== null ? `${age} years old` : "Enter date of birth"}
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-sage-700 dark:text-slate-300">
            Telephone number
          </span>
          <input
            type="tel"
            required
            autoComplete="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="07XXX XXXXXX"
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-sage-700 dark:text-slate-300">
              City / town
            </span>
            <input
              type="text"
              required
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Manchester"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-sage-700 dark:text-slate-300">
              Postcode
            </span>
            <input
              type="text"
              required
              autoComplete="postal-code"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="e.g. M1 1AA"
              className={inputClass}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full ${btnPrimaryClass}`}
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-sage-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-sage-700 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
