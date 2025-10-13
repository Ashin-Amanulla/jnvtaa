import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin" && user?.role !== "moderator") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

