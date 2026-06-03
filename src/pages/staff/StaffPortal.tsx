import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { APP_NAME } from "../../constants/brand";
import { useStaff } from "../../context/StaffContext";

export function StaffPortal() {
  const { unlock } = useStaff();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlock(code)) {
      setError(null);
      navigate("/staff/users", { replace: true });
      return;
    }
    setError("Invalid code.");
  };

  return (
    <div className="mx-auto max-w-md py-8 sm:py-12">
      <p className="mb-6 text-center">
        <Link
          to="/"
          className="text-sm font-medium text-teal-800 hover:text-teal-900"
        >
          ← Return to {APP_NAME} home
        </Link>
      </p>
      <h1 className="font-display text-2xl font-semibold text-sage-900">
        Staff portal
      </h1>
      <p className="mt-2 text-sage-600">
        Enter the staff access code to view all registered users and patient
        check-in history.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-sage-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <label className="block">
          <span className="text-sm font-medium text-sage-700">Staff code</span>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-200 px-3 py-2.5 outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-200"
            autoFocus
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-sage-700 py-3 font-semibold text-cream hover:bg-sage-800"
        >
          Unlock staff area
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-sage-500">
        Tip: use the small dot in the site footer on any page to open staff
        access quickly.
      </p>
    </div>
  );
}
