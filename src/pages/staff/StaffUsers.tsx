import { useCallback, useEffect, useState } from "react";
import {
  staffDeleteUser,
  staffFetchAllProfiles,
  staffSetProfileStatus,
} from "../../lib/db/profiles";
import { StaffBadge } from "../../components/StaffBadge";
import {
  getDisplayName,
  getUserAge,
  isAccountActive,
  statusLabel,
} from "../../lib/users";
import type { User } from "../../types";

export function StaffUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await staffFetchAllProfiles();
      setUsers(
        rows.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load users from cloud."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
      await refresh();
      setMessage(label);
      window.setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    }
  };

  const handleDeactivate = (u: User) => {
    if (u.isStaff) {
      setError("Staff accounts cannot be deactivated here.");
      return;
    }
    if (
      !window.confirm(
        `Deactivate ${getDisplayName(u)}? They will not be able to sign in.`
      )
    ) {
      return;
    }
    void runAction("Account deactivated.", () =>
      staffSetProfileStatus(u.id, "deactivated")
    );
  };

  const handleActivate = (u: User) => {
    void runAction("Account reactivated.", () =>
      staffSetProfileStatus(u.id, "active")
    );
  };

  const handleDelete = (u: User) => {
    if (u.isStaff) {
      setError("Staff accounts cannot be deleted from the admin panel.");
      return;
    }
    if (
      !window.confirm(
        `Permanently delete ${getDisplayName(u)} and all their tests and journal data? This cannot be undone.`
      )
    ) {
      return;
    }
    void runAction("Account deleted.", () => staffDeleteUser(u.id));
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-sage-900">
        Registered users
      </h2>
      <p className="mt-1 text-sm text-sage-600">
        {loading
          ? "Loading from cloud…"
          : `${users.length} account${users.length === 1 ? "" : "s"} · ${users.filter(isAccountActive).length} active · ${users.filter((u) => u.isStaff).length} staff`}
      </p>
      {message && (
        <p className="mt-2 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-sage-200 bg-white shadow-sm">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-sage-200 bg-sage-50 text-sage-700">
            <tr>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Full name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Postcode</th>
              <th className="px-4 py-3 font-medium">Telephone</th>
              <th className="px-4 py-3 font-medium">Age</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sage-500">
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sage-500">
                  No users registered yet.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const active = isAccountActive(u);
                return (
                  <tr
                    key={u.id}
                    className={
                      active ? "hover:bg-sage-50/50" : "bg-sage-50/80 opacity-80"
                    }
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          active
                            ? "bg-teal-100 text-teal-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {statusLabel(u.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-sage-900">
                      {getDisplayName(u)}
                      {u.isStaff && <StaffBadge />}
                    </td>
                    <td className="px-4 py-3 text-sage-700">{u.email}</td>
                    <td className="px-4 py-3 text-sage-700">{u.city || "—"}</td>
                    <td className="px-4 py-3 text-sage-700">
                      {u.postcode || "—"}
                    </td>
                    <td className="px-4 py-3 text-sage-700">
                      {u.telephone || "—"}
                    </td>
                    <td className="px-4 py-3 text-sage-700">
                      {getUserAge(u) ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {u.isStaff ? (
                        <span className="text-xs text-sage-500">Staff account</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {active ? (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(u)}
                              className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleActivate(u)}
                              className="rounded border border-teal-300 bg-teal-50 px-2 py-1 text-xs font-medium text-teal-900 hover:bg-teal-100"
                            >
                              Reactivate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
