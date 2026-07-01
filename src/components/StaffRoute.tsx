import { Navigate } from "react-router-dom";
import { AuthLoadingFallback } from "./AuthLoadingFallback";
import { useAuth } from "../context/AuthContext";

export function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingFallback />;

  if (!user?.isStaff) {
    return <Navigate to="/staff" replace />;
  }

  return children;
}
