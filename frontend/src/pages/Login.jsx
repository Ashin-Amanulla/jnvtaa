import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { authAPI } from "@/api";
import { SketchCard } from "@/components/SketchCard";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [quickRole, setQuickRole] = useState("alumni");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const quickAccounts = {
    alumni: {
      email: "alumni@jnvtaa.org",
      password: "alumni123",
      label: "Alumni",
      colorClass: "text-house-blue",
    },
    admin: {
      email: "admin@jnvtaa.org",
      password: "admin123",
      label: "Admin",
      colorClass: "text-house-red",
    },
  };

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
      login(response.data.user, response.data.token);
      navigate("/dashboard");
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
          <p className="inline-block rotate-[-2deg] rounded-wobblySm border-2 border-border bg-postit px-3 py-1 font-sans text-lg shadow-sketchSm">
            Welcome back, batchmate
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold text-foreground md:text-6xl">
            Sign in
          </h1>
          <div className="mx-auto mt-4 h-1 max-w-xs border-b-4 border-dashed border-foreground md:mx-0" />
          <p className="mt-4 font-sans text-xl text-muted-foreground">
            Your dashboard, doodles optional.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-house-green" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-house-red" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-house-blue" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-house-yellow" aria-hidden />
          </div>
        </div>

        <SketchCard decoration="tack" tilt className="p-8 md:p-10">
          <div className="mb-6 rounded-wobblySm border-2 border-dashed border-border bg-white p-4">
            <p className="mb-3 font-sans text-base text-muted-foreground">
              Quick login role
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={quickRole}
                onChange={(e) => setQuickRole(e.target.value)}
                className="input w-full sm:flex-1"
                aria-label="Select quick login role"
              >
                <option value="alumni">Alumni</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    email: quickAccounts[quickRole].email,
                    password: quickAccounts[quickRole].password,
                  });
                  setError("");
                }}
                className="btn-outline w-full justify-center sm:w-auto"
              >
                Use {quickAccounts[quickRole].label}
              </button>
            </div>
            <p className={`mt-2 font-sans text-sm ${quickAccounts[quickRole].colorClass}`}>
              {quickAccounts[quickRole].email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div
                className="rounded-wobblySm border-[3px] border-accent bg-white p-4 font-sans text-lg text-foreground shadow-sketchSm"
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
                  className="h-5 w-5 rounded-wobblySm border-2 border-border accent-accent"
                />
                Remember me
              </label>
              <a
                href="#"
                className="font-sans text-lg text-pen underline decoration-wavy decoration-2 underline-offset-4 hover:text-accent"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div className="mt-8 border-t-2 border-dashed border-border pt-8 text-center font-sans text-lg text-muted-foreground">
            New here?{" "}
            <Link
              to="/register"
              className="font-medium text-foreground underline decoration-dashed decoration-2 underline-offset-4 hover:text-accent"
            >
              Join JNVTAA
            </Link>
          </div>
        </SketchCard>
      </div>
    </div>
  );
}
