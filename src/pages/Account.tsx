import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { btnSecondaryClass, cardClass } from "../lib/ui";

export function Account() {
  const { user, deactivateMyAccount, deleteMyAccount } = useAuth();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const handleDeactivate = async () => {
    if (
      !window.confirm(
        "Deactivate your account? You will be signed out and cannot log in until staff reactivates your account. Your data will be kept."
      )
    ) {
      return;
    }
    setBusy(true);
    const err = await deactivateMyAccount();
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    navigate("/", { replace: true });
  };

  const handleDelete = async () => {
    if (confirmDelete.trim().toUpperCase() !== "DELETE") {
      setError('Type DELETE in the box to confirm permanent deletion.');
      return;
    }
    if (
      !window.confirm(
        "This permanently deletes your account, check-ins, and journal entries. This cannot be undone."
      )
    ) {
      return;
    }
    setBusy(true);
    const err = await deleteMyAccount();
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl font-semibold text-sage-900 dark:text-slate-100">
        Account settings
      </h1>
      <p className="mt-1 text-sage-600 dark:text-slate-400">
        Manage your Mind Scope account ({user.email}).
      </p>

      <div className={`mt-8 space-y-6 p-6 ${cardClass}`}>
        <div>
          <h2 className="font-medium text-sage-900 dark:text-slate-100">
            Deactivate account
          </h2>
          <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">
            Temporarily disable sign-in. Your check-ins and journal stay on file.
            Contact us or staff can reactivate you later.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={handleDeactivate}
            className={`mt-3 ${btnSecondaryClass}`}
          >
            Deactivate my account
          </button>
        </div>

        <div className="border-t border-sage-200 pt-6 dark:border-slate-700">
          <h2 className="font-medium text-red-800 dark:text-red-300">
            Delete account permanently
          </h2>
          <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">
            Removes your account and all wellness data from the cloud. This
            cannot be undone.
          </p>
          <label className="mt-3 block">
            <span className="text-sm text-sage-700 dark:text-slate-300">
              Type <strong>DELETE</strong> to confirm
            </span>
            <input
              type="text"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sage-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              autoComplete="off"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="mt-3 rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          >
            Delete my account forever
          </button>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-sm">
        <Link to="/dashboard" className="text-teal-700 underline dark:text-teal-400">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
