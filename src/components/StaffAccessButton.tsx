import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function StaffAccessButton() {
  const { user } = useAuth();

  const destination = user?.isStaff
    ? "/staff/users"
    : user
      ? "/staff"
      : "/login";

  const linkState = user ? undefined : { from: "/staff/users" };

  return (
    <Link
      to={destination}
      state={linkState}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-sage-200/60 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2 dark:hover:bg-slate-800/60 dark:focus:ring-slate-500 dark:focus:ring-offset-slate-900"
      aria-label={user?.isStaff ? "Open staff admin" : "Open staff portal"}
      title={user?.isStaff ? "Staff admin" : "Staff portal"}
    >
      <span
        className="h-2.5 w-2.5 rounded-full bg-sage-400 shadow-sm dark:bg-slate-500"
        aria-hidden
      />
    </Link>
  );
}
