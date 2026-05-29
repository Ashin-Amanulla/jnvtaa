import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import { getDefaultLandingPath } from "@/utils/roles";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const { data, isError } = useQuery({
    queryKey: ["auth-me", token],
    queryFn: () => authAPI.getMe(),
    enabled: !!token && !error,
    retry: false,
  });

  useEffect(() => {
    if (error) {
      navigate("/login?error=google_auth_failed", { replace: true });
      return;
    }
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    localStorage.setItem("token", token);
  }, [error, token, navigate]);

  useEffect(() => {
    if (data?.data?.user && token) {
      const user = data.data.user;
      login(user, token);
      navigate(getDefaultLandingPath(user), { replace: true });
    }
  }, [data, token, login, navigate]);

  useEffect(() => {
    if (isError) {
      navigate("/login?error=google_auth_failed", { replace: true });
    }
  }, [isError, navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background">
      <LoadingSpinner />
      <span className="sr-only">Completing sign in…</span>
    </div>
  );
}
