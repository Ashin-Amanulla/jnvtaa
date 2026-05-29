import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { isSuperAdmin } from "@/utils/roles";

export default function RequireSuperAdmin({ children }) {
  const { user } = useAuthStore();

  if (!isSuperAdmin(user)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
