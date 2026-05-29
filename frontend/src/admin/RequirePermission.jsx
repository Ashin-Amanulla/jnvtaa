import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { hasPermission } from "@/utils/roles";

export default function RequirePermission({ permission, children }) {
  const { user } = useAuthStore();

  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
