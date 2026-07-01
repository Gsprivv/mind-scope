import { Navigate, useLocation } from "react-router-dom";
import { AuthLoadingFallback } from "./AuthLoadingFallback";
import { useAuth } from "../context/AuthContext";

export function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingFallback />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (!user.isStaff) {
    return <Navigate to="/staff" replace />;
  }

  return children;
}
