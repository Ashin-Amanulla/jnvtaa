import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { authAPI, batchesAPI } from "@/api";
import { SketchCard } from "@/components/SketchCard";

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
          <p className="inline-block rotate-1 rounded-wobblySm border-2 border-border bg-white px-3 py-1 font-sans text-lg shadow-sketch">
            One of us, one of us
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">
            Join JNVTAA
          </h1>
          <div className="mx-auto mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground md:mx-0" />
          <p className="mt-4 font-sans text-xl text-muted-foreground">
            Claim your spot on the alumni cork board.
          </p>
        </div>

        <SketchCard decoration="tape" tilt className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div
                className="rounded-wobblySm border-[3px] border-accent bg-white p-4 font-sans text-lg shadow-sketchSm"
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
                Minimum 6 characters (more if your cat walks on the keyboard).
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
                      Batch of {batch.year}
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
                placeholder="If you still remember it"
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
                className="mt-1 h-5 w-5 shrink-0 rounded-wobblySm border-2 border-border accent-accent"
              />
              <span>
                I agree to the{" "}
                <a
                  href="#"
                  className="text-pen underline decoration-wavy decoration-2 underline-offset-4"
                >
                  messy terms
                </a>{" "}
                (we’re still rewriting them in pencil).
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Creating…" : "Create my card →"}
            </button>
          </form>

          <div className="mt-8 border-t-2 border-dashed border-border pt-8 text-center font-sans text-lg text-muted-foreground">
            Already in?{" "}
            <Link
              to="/login"
              className="font-medium text-foreground underline decoration-dashed decoration-2 underline-offset-4 hover:text-accent"
            >
              Sign in
            </Link>
          </div>
        </SketchCard>
      </div>
    </div>
  );
}
