import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { APP_NAME } from "../../constants/brand";
import { useAuth } from "../../context/AuthContext";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-4 py-2 text-sm font-medium ${
    isActive
      ? "bg-sage-700 text-cream"
      : "bg-sage-100 text-sage-700 hover:bg-sage-200"
  }`;

export function StaffShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin =
    location.pathname.startsWith("/staff/users") ||
    location.pathname.startsWith("/staff/history");

  return (
    <div className="min-h-screen bg-sage-50">
      <header className="border-b border-sage-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
            >
              <span aria-hidden>←</span>
              Back to app
            </Link>
            {isAdmin && user && (
              <p className="text-sm text-sage-600">
                Signed in as <strong>{user.fullName}</strong> (staff)
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-sage-100 pt-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-sage-500">
                  Staff only
                </p>
                <h1 className="font-display text-xl font-semibold text-sage-900">
                  {APP_NAME} — Admin
                </h1>
              </div>
              <nav className="flex flex-wrap gap-2">
                <NavLink to="/staff/users" className={tabClass}>
                  All users
                </NavLink>
                <NavLink to="/staff/history" className={tabClass}>
                  All tests
                </NavLink>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Exit to app
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
