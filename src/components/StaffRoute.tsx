import { Navigate } from "react-router-dom";
import { useStaff } from "../context/StaffContext";

export function StaffRoute({ children }: { children: React.ReactNode }) {
  const { isStaff } = useStaff();

  if (!isStaff) {
    return <Navigate to="/staff" replace />;
  }

  return children;
}
