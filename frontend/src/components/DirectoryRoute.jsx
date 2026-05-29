import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { canAccessAdmin } from "@/utils/roles";
import Directory from "@/pages/Directory";

export default function DirectoryRoute() {
  const { user } = useAuthStore();

  if (canAccessAdmin(user)) {
    return <Navigate to="/admin/directory" replace />;
  }

  return <Directory />;
}
