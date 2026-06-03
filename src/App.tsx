import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { StaffRoute } from "./components/StaffRoute";
import { useAuth } from "./context/AuthContext";
import { CheckIn } from "./pages/CheckIn";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Account } from "./pages/Account";
import { Journal } from "./pages/Journal";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Contact } from "./pages/Contact";
import { Signup } from "./pages/Signup";
import { StaffAllHistory } from "./pages/staff/StaffAllHistory";
import { StaffLayout } from "./pages/staff/StaffLayout";
import { StaffPortal } from "./pages/staff/StaffPortal";
import { StaffShell } from "./pages/staff/StaffShell";
import { StaffUsers } from "./pages/staff/StaffUsers";

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="contact" element={<Contact />} />
        <Route
          path="login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="signup"
          element={
            <GuestOnly>
              <Signup />
            </GuestOnly>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="check-in"
          element={
            <ProtectedRoute>
              <CheckIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="journal"
          element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          }
        />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="/staff" element={<StaffShell />}>
        <Route index element={<StaffPortal />} />
        <Route
          element={
            <StaffRoute>
              <StaffLayout />
            </StaffRoute>
          }
        >
          <Route path="users" element={<StaffUsers />} />
          <Route path="history" element={<StaffAllHistory />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
