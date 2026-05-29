import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import { SketchCard } from "@/components/SketchCard";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword(token, { password });
      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Reset failed. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center md:text-left">
          <p className="inline-block rotate-1 rounded-xl border border-border bg-white px-3 py-1 font-sans text-lg shadow-card">
            Fresh start
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">
            New password
          </h1>
          <div className="mx-auto mt-4 h-1 max-w-xs border-b-2 border-brand md:mx-0" />
        </div>

        <SketchCard decoration="tack" tilt className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="rounded-xl border-[3px] border-accent p-4 font-sans text-lg" role="alert">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="password" className="label">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {isLoading ? "Updating…" : "Set new password →"}
            </button>
            <p className="text-center font-sans text-lg text-muted-foreground">
              <Link to="/login" className="text-brand font-medium">
                Back to sign in
              </Link>
            </p>
          </form>
        </SketchCard>
      </div>
    </div>
  );
}
