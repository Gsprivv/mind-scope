import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { PremiumBadge } from "../components/PremiumGate";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import { formatDateUK } from "../lib/formatDate";
import { getDisplayName, getUserAge } from "../lib/users";
import { btnPrimaryClass, btnSecondaryClass, cardClass, inputClass } from "../lib/ui";
import { StaffBadge } from "../components/StaffBadge";

export function Account() {
  const { user, deactivateMyAccount, deleteMyAccount, updateMyContact, refreshUser } =
    useAuth();
  const { isPremium, planLabel, expiresLabel } = useSubscription();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editingContact, setEditingContact] = useState(false);

  if (!user) return null;

  const startEditContact = () => {
    setEditEmail(user.email);
    setEditPhone(user.telephone);
    setEditingContact(true);
    setError(null);
    setSuccess(null);
  };

  const handleContactSave = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    const err = await updateMyContact(editEmail, editPhone);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setEditingContact(false);
    setSuccess("Contact details updated.");
    await refreshUser();
  };

  const handleDeactivate = async () => {
    if (user.isStaff) {
      setError("Staff accounts cannot be self-deactivated here.");
      return;
    }
    if (
      !window.confirm(
        "Deactivate your account? You will be signed out and cannot log in until staff reactivates your account."
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
    if (user.isStaff) {
      setError("Staff accounts cannot be deleted from this page.");
      return;
    }
    if (confirmDelete.trim().toUpperCase() !== "DELETE") {
      setError("Type DELETE in the box to confirm permanent deletion.");
      return;
    }
    if (
      !window.confirm(
        "This permanently deletes your account, tests, and journal entries."
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
        Your profile and account options.
      </p>

      <div className={`mt-8 p-6 ${cardClass}`}>
        <h2 className="font-medium text-sage-900 dark:text-slate-100">
          Your details
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-sage-500 dark:text-slate-400">Full name</dt>
            <dd className="font-medium text-sage-900 dark:text-slate-100">
              {getDisplayName(user)}
              {user.isStaff && <StaffBadge />}
            </dd>
          </div>
          <div>
            <dt className="text-sage-500 dark:text-slate-400">Date of birth</dt>
            <dd className="text-sage-800 dark:text-slate-200">
              {formatDateUK(user.dateOfBirth)}
              {getUserAge(user) != null && (
                <span className="text-sage-500"> ({getUserAge(user)} years old)</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sage-500 dark:text-slate-400">Email</dt>
            <dd className="text-sage-800 dark:text-slate-200">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sage-500 dark:text-slate-400">Telephone</dt>
            <dd className="text-sage-800 dark:text-slate-200">{user.telephone}</dd>
          </div>
          <div>
            <dt className="text-sage-500 dark:text-slate-400">Location</dt>
            <dd className="text-sage-800 dark:text-slate-200">
              {user.city}, {user.postcode}
            </dd>
          </div>
        </dl>

        {!editingContact ? (
          <button
            type="button"
            onClick={startEditContact}
            className={`mt-5 ${btnSecondaryClass}`}
          >
            Change email or phone
          </button>
        ) : (
          <form onSubmit={handleContactSave} className="mt-5 space-y-3 border-t border-sage-200 pt-5 dark:border-slate-700">
            <label className="block">
              <span className="text-sm font-medium text-sage-700 dark:text-slate-300">
                New email
              </span>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-sage-700 dark:text-slate-300">
                New telephone
              </span>
              <input
                type="tel"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className={inputClass}
              />
            </label>
            <p className="text-xs text-sage-500 dark:text-slate-400">
              Changing email may require confirmation via a link sent to your new
              address (Supabase security).
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy} className={btnPrimaryClass}>
                Save changes
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditingContact(false)}
                className={btnSecondaryClass}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {user.isStaff && (
          <p className="mt-4 text-sm text-indigo-800 dark:text-indigo-200">
            You are signed in as <strong>staff</strong>. Open{" "}
            <Link to="/staff/users" className="underline">
              Staff admin
            </Link>{" "}
            to manage users and view all tests.
          </p>
        )}
      </div>

      {!user.isStaff && (
        <div className={`mt-6 p-6 ${cardClass}`}>
          <h2 className="font-medium text-sage-900 dark:text-slate-100">
            Subscription
          </h2>
          {isPremium ? (
            <p className="mt-2 text-sm text-sage-700 dark:text-slate-300">
              You have <PremiumBadge /> {planLabel && `(${planLabel})`}
              {expiresLabel && <> · active until {expiresLabel}</>}.
            </p>
          ) : (
            <p className="mt-2 text-sm text-sage-600 dark:text-slate-400">
              Basic plan — wellness test and latest score only. Upgrade for charts,
              insights, weekly reports, and BMI coaching.
            </p>
          )}
          <Link to="/premium" className={`mt-4 inline-block ${btnPrimaryClass}`}>
            {isPremium ? "Manage Premium" : "Upgrade to Premium"}
          </Link>
        </div>
      )}

      {!user.isStaff && (
        <div className={`mt-6 space-y-6 p-6 ${cardClass}`}>
          <div>
            <h2 className="font-medium text-sage-900 dark:text-slate-100">
              Deactivate account
            </h2>
            <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">
              Temporarily disable sign-in. Your data stays on file until staff
              reactivates you.
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
              Removes your account and all wellness data. This cannot be undone.
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
        </div>
      )}

      {success && (
        <p className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
          {success}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-sm">
        <Link to="/dashboard" className="text-teal-700 underline dark:text-teal-400">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
