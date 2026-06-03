import { useEffect, useState } from "react";
import { formatDateTimeUK } from "../../lib/formatDate";
import { staffFetchAllCheckIns } from "../../lib/db/checkIns";
import { staffFetchAllProfiles } from "../../lib/db/profiles";
import { getRiskInfo, RISK_LABELS } from "../../lib/risk";
import { useStaff } from "../../context/StaffContext";
import { getDisplayName } from "../../lib/users";
import type { CheckIn, User } from "../../types";

export function StaffAllHistory() {
  const { staffCode } = useStaff();
  const [users, setUsers] = useState<User[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!staffCode) return;

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      staffFetchAllProfiles(staffCode),
      staffFetchAllCheckIns(staffCode),
    ])
      .then(([profileRows, checkInRows]) => {
        if (!active) return;
        setUsers(profileRows);
        setCheckIns(
          checkInRows.sort(
            (a, b) =>
              new Date(b.completedAt).getTime() -
              new Date(a.completedAt).getTime()
          )
        );
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Could not load check-ins."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [staffCode]);

  const userById = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-sage-900">
        All patient check-ins
      </h2>
      <p className="mt-1 text-sm text-sage-600">
        {loading
          ? "Loading from cloud…"
          : `${checkIns.length} check-in${checkIns.length === 1 ? "" : "s"} from all users.`}
      </p>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-sage-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-sage-200 bg-sage-50 text-sage-700">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Risk level</th>
              <th className="px-4 py-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sage-500">
                  Loading check-ins…
                </td>
              </tr>
            ) : checkIns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sage-500">
                  No check-ins recorded yet.
                </td>
              </tr>
            ) : (
              checkIns.map((c) => {
                const patient = userById[c.userId];
                const risk = getRiskInfo(c.score);
                return (
                  <tr key={c.id} className="hover:bg-sage-50/50">
                    <td className="px-4 py-3 font-medium text-sage-900">
                      {patient ? getDisplayName(patient) : "Unknown user"}
                    </td>
                    <td className="px-4 py-3 text-sage-600">
                      {patient?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sage-700">
                      {formatDateTimeUK(c.completedAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-sage-800">
                      {c.score}%
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${risk.colorClass}`}
                      >
                        {RISK_LABELS[risk.level]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sage-600">
                      {c.sleepHours != null ? `${c.sleepHours}h sleep` : "—"}
                      {c.note ? ` · ${c.note.slice(0, 40)}…` : ""}
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
