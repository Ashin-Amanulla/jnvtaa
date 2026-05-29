import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { canAccessAdmin } from "@/utils/roles";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (!canAccessAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
