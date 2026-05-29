import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { authAPI, batchesAPI, getGoogleAuthUrl } from "@/api";
import { SketchCard } from "@/components/SketchCard";
import { getBatchDisplayYear } from "@/utils/format";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    batch: "",
    rollNumber: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const { data: batchesData } = useQuery({
    queryKey: ["batches"],
    queryFn: () => batchesAPI.getAll({ limit: 100 }),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await authAPI.register(formData);
      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-10">
        <div className="text-center md:text-left">
          <p className="inline-block rotate-1 rounded-xl border-2 border-border bg-white px-3 py-1 font-sans text-lg shadow-card">
            Join our alumni network
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">
            Join JNVTAA
          </h1>
          <div className="mx-auto mt-4 h-1 max-w-sm border-b-2 border-brand md:mx-0" />
          <p className="mt-4 font-sans text-xl text-muted-foreground">
            Register as a member of the JNV Thiruvananthapuram alumni
            association and stay connected with fellow Navodayans.
          </p>
        </div>

        <SketchCard decoration="tape" tilt className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div
                className="rounded-xl border-[3px] border-accent bg-white p-4 font-sans text-lg shadow-card"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="label">
                  First name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="input"
                  placeholder="Given name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="label">
                  Last name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="input"
                  placeholder="Family name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email *
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
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <p className="mt-2 font-sans text-base text-muted-foreground">
                Minimum 6 characters.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <label htmlFor="phone" className="label">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="+91 …"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="batch" className="label">
                  Batch *
                </label>
                <select
                  id="batch"
                  name="batch"
                  required
                  className="input"
                  value={formData.batch}
                  onChange={handleChange}
                >
                  <option value="">Pick your year</option>
                  {batchesData?.data?.batches?.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      Batch of {getBatchDisplayYear(batch)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="rollNumber" className="label">
                Roll number (optional)
              </label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                className="input"
                placeholder="Optional"
                value={formData.rollNumber}
                onChange={handleChange}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 font-sans text-lg">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-1 h-5 w-5 shrink-0 rounded-xl border-2 border-border accent-accent"
              />
              <span>
                I agree to the{""}
                <a
                  href="#"
                  className="text-brand font-medium"
                >
                  terms of membership
                </a>{""}
                of JNVTAA.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Creating…" : "Create account →"}
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
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-8 text-center font-sans text-lg text-muted-foreground">
            Already in?{""}
            <Link
              to="/login"
              className="font-medium text-foreground font-medium hover:text-accent"
            >
              Sign in
            </Link>
          </div>
        </SketchCard>
      </div>
    </div>
  );
}
