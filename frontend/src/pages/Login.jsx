import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { authAPI, getGoogleAuthUrl } from "@/api";
import { getPostAuthPath } from "@/utils/roles";
import { SketchCard } from "@/components/SketchCard";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const nextPath = searchParams.get("next");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await authAPI.login(formData);
      const user = response.data.user;
      login(user, response.data.token);
      const destination = getPostAuthPath(user, nextPath);
      navigate(destination);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center md:text-left">
          <p className="inline-block rounded-xl border-2 border-border bg-house-yellow-soft px-3 py-1 font-sans text-lg shadow-card">
            Welcome back, Navodayan
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold text-foreground md:text-6xl">
            Sign in
          </h1>
          <div className="mx-auto mt-4 h-1 max-w-xs border-b-2 border-brand md:mx-0" />
          <p className="mt-4 font-sans text-xl text-muted-foreground">
            Access your JNVTAA member dashboard, events, and alumni network.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-house-green" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-house-red" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-house-blue" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-house-yellow" aria-hidden />
          </div>
        </div>

        <SketchCard decoration="tack" tilt className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div
                className="rounded-xl border-[3px] border-accent bg-white p-4 font-sans text-lg text-foreground shadow-card"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2 font-sans text-lg">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 rounded-xl border-2 border-border accent-accent"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="font-sans text-lg text-brand font-medium hover:text-accent"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Signing in…" : "Sign in →"}
            </button>

            <div className="relative py-2">
              <div className="section-divider" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 font-sans text-sm text-muted-foreground">
                or
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = getGoogleAuthUrl();
              }}
              className="btn-outline w-full justify-center gap-3"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-8 text-center font-sans text-lg text-muted-foreground">
            New here?{""}
            <Link
              to="/register"
              className="font-medium text-foreground font-medium hover:text-accent"
            >
              Join JNVTAA
            </Link>
          </div>
        </SketchCard>
      </div>
    </div>
  );
}
