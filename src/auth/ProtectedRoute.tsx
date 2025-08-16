// ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type Props = {
  redirectTo?: string;
  requireVerified?: boolean;
};

export default function ProtectedRoute({
  redirectTo = "/login",
  requireVerified = true,
}: Props) {
  const { user, loading } = useAuth(); // console.log LOCATION #PR1: auth state in guard
  const location = useLocation();
  // console.log LOCATION #PR2: current pathname used for next
  console.log("[ProtectedRoute] path:", location.pathname, "user:", !!user);

  if (loading) return null; // or a spinner

  const needsLogin = !user || (requireVerified && !user.emailVerified);

  if (needsLogin) {
    const next = encodeURIComponent(location.pathname + location.search || "/todo");
    // console.log LOCATION #PR3: redirecting with next
    console.log("[ProtectedRoute] redirect to login with next=", next);
    return <Navigate to={`${redirectTo}?next=${next}`} replace />;
  }

  return <Outlet />;
}
