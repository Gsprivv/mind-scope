import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaff } from "../context/StaffContext";

export function StaffAccessButton() {
  const { unlock } = useStaff();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlock(code)) {
      setOpen(false);
      setCode("");
      setError(null);
      navigate("/staff/users");
      return;
    }
    setError("Invalid code.");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-2 w-2 shrink-0 rounded-full bg-sage-300/70 hover:bg-sage-400 dark:bg-slate-600/80 dark:hover:bg-slate-500"
        aria-label=" "
        title=""
      />
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-sage-900/40 p-4 dark:bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="staff-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2
              id="staff-dialog-title"
              className="font-display text-lg font-semibold text-sage-900 dark:text-slate-100"
            >
              Staff access
            </h2>
            <p className="mt-1 text-sm text-sage-600 dark:text-slate-400">
              Enter the staff code to continue.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {error && (
                <p className="text-sm text-red-700 dark:text-red-300" role="alert">
                  {error}
                </p>
              )}
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Code"
                className="w-full rounded-lg border border-sage-200 px-3 py-2.5 outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setCode("");
                    setError(null);
                  }}
                  className="flex-1 rounded-lg border border-sage-200 py-2.5 text-sm font-medium text-sage-700 dark:border-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-sage-700 py-2.5 text-sm font-medium text-cream dark:bg-slate-700"
                >
                  Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
