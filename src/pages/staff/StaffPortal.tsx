import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { APP_NAME } from "../../constants/brand";
import { useAuth } from "../../context/AuthContext";
import { btnPrimaryClass, cardClass } from "../../lib/ui";

export function StaffPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isStaff) {
      navigate("/staff/users", { replace: true });
    }
  }, [user, navigate]);

  if (user?.isStaff) return null;

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
        Staff must sign in with their Mind Scope staff account to view all
        users and wellness test history.
      </p>

      {user && !user.isStaff ? (
        <div className={`mt-8 p-6 ${cardClass}`}>
          <p className="text-sm text-red-800" role="alert">
            You are signed in as a regular user ({user.email}). Staff access
            requires a staff account.
          </p>
          <Link to="/dashboard" className={`mt-4 inline-block ${btnPrimaryClass}`}>
            Go to dashboard
          </Link>
        </div>
      ) : (
        <div className={`mt-8 space-y-4 p-6 ${cardClass}`}>
          <p className="text-sm text-sage-700">
            Use your staff email and password on the sign-in page — the same
            login works for the app and the staff admin area.
          </p>
          <Link
            to="/login"
            state={{ from: "/staff/users" }}
            className={`block w-full text-center ${btnPrimaryClass}`}
          >
            Staff sign in
          </Link>
          <p className="text-center text-xs text-sage-500">
            After signing in, open <strong>Staff admin</strong> in the menu or
            the small dot in the footer.
          </p>
        </div>
      )}
    </div>
  );
}
