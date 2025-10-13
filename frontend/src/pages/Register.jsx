import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { authAPI, batchesAPI } from "@/api";

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">Join JNVTAA</h2>
          <p className="mt-2 text-gray-600">Connect with your fellow alumni</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="label">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="input"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="label">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="input"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
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
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">Minimum 6 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="label">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="batch" className="label">
                  Batch/Year *
                </label>
                <select
                  id="batch"
                  name="batch"
                  required
                  className="input"
                  value={formData.batch}
                  onChange={handleChange}
                >
                  <option value="">Select your batch</option>
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
                Roll Number (Optional)
              </label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                className="input"
                placeholder="Your roll number at JNV"
                value={formData.rollNumber}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{" "}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Terms and Conditions
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
