import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type Props = {
  requireVerified?: boolean; // default true
  redirectTo?: string;       // default "/login"
};

export default function ProtectedRoute({ requireVerified = true, redirectTo = "/login" }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    // console.log LOCATION #P1: still loading
    console.log("[ProtectedRoute] loading auth...");
    return <p className="muted">Loading…</p>;
  }

  if (!user) {
    // console.log LOCATION #P2: no user
    console.log("[ProtectedRoute] no user → redirect");
    return <Navigate to={redirectTo} replace />;
  }

  if (requireVerified && !user.emailVerified) {
    // console.log LOCATION #P3: not verified
    console.log("[ProtectedRoute] user not verified → redirect to /login");
    return <Navigate to="/login" replace />;
  }

  // console.log LOCATION #P4: allowed
  console.log("[ProtectedRoute] access granted to route");
  return <Outlet />;
}
