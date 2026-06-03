import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { APP_NAME, WELLNESS_TEST_LABEL } from "../constants/brand";
import { InstallAppBanner } from "./InstallAppBanner";
import { SupabaseSetupBanner } from "./SupabaseSetupBanner";
import { ChatWidget } from "./ChatWidget";
import { Footer } from "./Footer";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { getDisplayName } from "../lib/users";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
      : "text-sage-600 hover:bg-sage-50 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream dark:bg-slate-950">
      <InstallAppBanner />
      <SupabaseSetupBanner />
      <header className="sticky top-0 z-30 border-b border-sage-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-sm font-bold text-white shadow-sm">
              MS
            </span>
            <div className="leading-tight">
              <span className="font-display text-lg font-semibold text-sage-900 dark:text-white">
                {APP_NAME}
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-sage-500 dark:text-slate-500">
                UK Wellness
              </span>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-1">
            <ThemeToggle />
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  <span className="hidden sm:inline">Dashboard</span>
                </NavLink>
                <NavLink to="/history" className={navLinkClass}>
                  <span className="hidden md:inline">Insights</span>
                </NavLink>
                <NavLink to="/journal" className={navLinkClass}>
                  <span className="hidden lg:inline">Journal</span>
                </NavLink>
                <NavLink to="/bmi" className={navLinkClass}>
                  <span className="hidden lg:inline">BMI</span>
                </NavLink>
                <NavLink to="/account" className={navLinkClass}>
                  <span className="hidden xl:inline">Account</span>
                </NavLink>
                {user.isStaff && (
                  <NavLink to="/staff/users" className={navLinkClass}>
                    <span className="hidden md:inline">Staff admin</span>
                  </NavLink>
                )}
                <NavLink
                  to="/check-in"
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-semibold ${
                      isActive
                        ? "bg-teal-600 text-white dark:bg-teal-500"
                        : "bg-teal-50 text-teal-800 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300"
                    }`
                  }
                >
                  {WELLNESS_TEST_LABEL}
                </NavLink>
                <span className="hidden text-sm text-sage-500 lg:inline dark:text-slate-400">
                  {getDisplayName(user).split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-sm text-sage-600 hover:bg-sage-50 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 dark:bg-teal-500"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
