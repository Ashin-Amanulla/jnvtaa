import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "@/api";
import { SketchCard } from "@/components/SketchCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center md:text-left">
          <p className="inline-block rounded-xl border border-border bg-house-yellow-soft px-3 py-1 font-sans text-lg shadow-card">
            Locked out?
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">
            Reset password
          </h1>
          <div className="mx-auto mt-4 h-1 max-w-xs border-b-2 border-brand md:mx-0" />
          <p className="mt-4 font-sans text-xl text-muted-foreground">
            Enter your registered email and we will send you a secure link to reset your password.
          </p>
        </div>

        <SketchCard decoration="tape" tilt className="p-8 md:p-10">
          {success ? (
            <div className="space-y-6 text-center font-sans text-lg">
              <p>
                If that email exists, a reset link has been sent. Check your inbox
                (and spam folder if needed).
              </p>
              <Link to="/login" className="btn-primary inline-flex">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="rounded-xl border-[3px] border-accent p-4 font-sans text-lg" role="alert">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {isLoading ? "Sending…" : "Send reset link →"}
              </button>
              <p className="text-center font-sans text-lg text-muted-foreground">
                Remembered it?{""}
                <Link to="/login" className="text-brand font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </SketchCard>
      </div>
    </div>
  );
}
