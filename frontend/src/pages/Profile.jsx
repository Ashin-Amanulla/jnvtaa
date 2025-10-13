import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usersAPI, batchesAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FaSave, FaUser, FaCamera } from "react-icons/fa";

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
    currentCity: "",
    currentCountry: "",
    profession: "",
    company: "",
    industry: "",
    socialLinks: {
      linkedin: "",
      facebook: "",
      twitter: "",
      instagram: "",
    },
    privacySettings: {
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showProfession: true,
    },
  });
  const [success, setSuccess] = useState(false);

  const { data: batchesData } = useQuery({
    queryKey: ["batches"],
    queryFn: () => batchesAPI.getAll({ limit: 100 }),
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        bio: user.bio || "",
        currentCity: user.currentCity || "",
        currentCountry: user.currentCountry || "",
        profession: user.profession || "",
        company: user.company || "",
        industry: user.industry || "",
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || "",
          facebook: user.socialLinks?.facebook || "",
          twitter: user.socialLinks?.twitter || "",
          instagram: user.socialLinks?.instagram || "",
        },
        privacySettings: {
          showEmail: user.privacySettings?.showEmail || false,
          showPhone: user.privacySettings?.showPhone || false,
          showLocation: user.privacySettings?.showLocation || true,
          showProfession: user.privacySettings?.showProfession || true,
        },
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => usersAPI.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("socialLinks.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [field]: value },
      });
    } else if (name.startsWith("privacy.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        privacySettings: { ...formData.privacySettings, [field]: checked },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Edit Profile
          </h1>
          <p className="text-gray-600">
            Keep your information up to date
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 animate-slide-down">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="card p-8 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaCamera />
              Profile Picture
            </h2>
            <div className="flex items-center gap-6">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=128`
                }
                alt={user?.firstName}
                className="w-24 h-24 rounded-full border-4 border-gray-200"
              />
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  In production, you would be able to upload a new photo here
                </p>
                <button type="button" className="btn-outline text-sm">
                  Change Photo
                </button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="card p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaUser />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="label">Batch</label>
                <input
                  type="text"
                  value={user?.batch?.year ? `Batch of ${user.batch.year}` : "Not set"}
                  disabled
                  className="input bg-gray-100"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="label">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="input"
                placeholder="Tell us about yourself..."
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length} / 500 characters
              </p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="card p-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Current City</label>
                <input
                  type="text"
                  name="currentCity"
                  value={formData.currentCity}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Mumbai"
                />
              </div>

              <div>
                <label className="label">Country</label>
                <input
                  type="text"
                  name="currentCountry"
                  value={formData.currentCountry}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., India"
                />
              </div>

              <div>
                <label className="label">Profession</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <label className="label">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Google"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Technology"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="card p-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Social Media Links
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">LinkedIn</label>
                <input
                  type="url"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="label">Facebook</label>
                <input
                  type="url"
                  name="socialLinks.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>

              <div>
                <label className="label">Twitter</label>
                <input
                  type="url"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <label className="label">Instagram</label>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card p-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Privacy Settings
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="privacy.showEmail"
                  checked={formData.privacySettings.showEmail}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-gray-700">Show email on profile</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="privacy.showPhone"
                  checked={formData.privacySettings.showPhone}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-gray-700">Show phone number on profile</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="privacy.showLocation"
                  checked={formData.privacySettings.showLocation}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-gray-700">Show location on profile</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="privacy.showProfession"
                  checked={formData.privacySettings.showProfession}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-gray-700">Show profession on profile</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isLoading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave />
              {updateProfileMutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

