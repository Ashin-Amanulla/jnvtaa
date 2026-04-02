import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usersAPI, batchesAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Save, UserCircle, Camera, CheckSquare } from "lucide-react";

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
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-16">
          <p className="mb-3 inline-block rotate-[-1deg] rounded-wobblySm border-2 border-border bg-postit px-3 py-1 font-sans text-lg shadow-sketchSm">
            Your alumni card
          </p>
          <h1 className="mb-4 font-display text-5xl font-bold md:text-6xl">
            Edit profile
          </h1>
          <div className="h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 font-sans text-xl text-muted-foreground">
            Keep classmates from guessing—it&apos;s you, just sharper.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="border-[2px] border-foreground p-6 mb-12 bg-foreground text-background flex items-center justify-between">
            <span className="font-mono text-sm tracking-widest uppercase font-bold">Profile updated successfully</span>
            <CheckSquare className="text-background" size={24} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Profile Picture */}
          <div className="card p-10 border-[2px] border-border bg-background">
            <h2 className="text-2xl font-display tracking-tighter mb-8 flex items-center gap-3">
              <Camera size={24} strokeWidth={1.5} />
              Avatar
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=128&background=000&color=fff`
                }
                alt={user?.firstName}
                className="w-32 h-32 object-cover grayscale border-[2px] border-border"
              />
              <div>
                <p className="font-sans text-muted-foreground mb-6 max-w-sm">
                  In production, you would be able to upload a new photo here.
                </p>
                <button type="button" className="btn btn-outline border-[2px]">
                  Change Photo
                </button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="card p-10 border-[2px] border-border bg-background">
            <h2 className="text-2xl font-display tracking-tighter mb-8 flex items-center gap-3">
              <UserCircle size={24} strokeWidth={1.5} />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="label">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="input border-[2px]" />
              </div>

              <div>
                <label className="label">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="input border-[2px]" />
              </div>

              <div>
                <label className="label">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input border-[2px]" placeholder="+91 98765 43210" />
              </div>

              <div>
                <label className="label">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input border-[2px]" />
              </div>

              <div>
                <label className="label">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input border-[2px]">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="label text-muted-foreground">Batch</label>
                <input type="text" value={user?.batch?.year ? `Batch of ${user.batch.year}` : "Not set"} disabled className="input border-[2px] bg-muted text-muted-foreground cursor-not-allowed" />
              </div>
            </div>

            <div className="mt-8">
              <label className="label">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} maxLength={500} className="input border-[2px] resize-none" placeholder="Tell us about yourself..."></textarea>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-3">
                {formData.bio.length} / 500 CHARACTERS
              </p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="card p-10 border-[2px] border-border bg-background">
            <h2 className="text-2xl font-display tracking-tighter mb-8">
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="label">Current City</label>
                <input type="text" name="currentCity" value={formData.currentCity} onChange={handleChange} className="input border-[2px]" placeholder="e.g. Mumbai" />
              </div>
              <div>
                <label className="label">Country</label>
                <input type="text" name="currentCountry" value={formData.currentCountry} onChange={handleChange} className="input border-[2px]" placeholder="e.g. India" />
              </div>
              <div>
                <label className="label">Profession</label>
                <input type="text" name="profession" value={formData.profession} onChange={handleChange} className="input border-[2px]" placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label className="label">Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="input border-[2px]" placeholder="e.g. Google" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Industry</label>
                <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="input border-[2px]" placeholder="e.g. Technology" />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="card p-10 border-[2px] border-border bg-background">
            <h2 className="text-2xl font-display tracking-tighter mb-8">
              Social Media Links
            </h2>
            <div className="space-y-6">
              <div>
                <label className="label">LinkedIn</label>
                <input type="url" name="socialLinks.linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} className="input border-[2px]" placeholder="https://linkedin.com/in/yourprofile" />
              </div>
              <div>
                <label className="label">Facebook</label>
                <input type="url" name="socialLinks.facebook" value={formData.socialLinks.facebook} onChange={handleChange} className="input border-[2px]" placeholder="https://facebook.com/yourprofile" />
              </div>
              <div>
                <label className="label">Twitter</label>
                <input type="url" name="socialLinks.twitter" value={formData.socialLinks.twitter} onChange={handleChange} className="input border-[2px]" placeholder="https://twitter.com/yourhandle" />
              </div>
              <div>
                <label className="label">Instagram</label>
                <input type="url" name="socialLinks.instagram" value={formData.socialLinks.instagram} onChange={handleChange} className="input border-[2px]" placeholder="https://instagram.com/yourhandle" />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card p-10 border-[2px] border-border bg-background">
            <h2 className="text-2xl font-display tracking-tighter mb-8">
              Privacy Settings
            </h2>
            <div className="space-y-6">
              <label className="flex items-center gap-4 cursor-pointer group">
                <input type="checkbox" name="privacy.showEmail" checked={formData.privacySettings.showEmail} onChange={handleChange} className="w-6 h-6 border-[2px] border-border rounded-none accent-foreground focus:ring-0 focus:ring-offset-0 bg-background checked:bg-foreground" />
                <span className="font-sans text-lg group-hover:text-muted-foreground transition-colors">Show email on profile</span>
              </label>
              <label className="flex items-center gap-4 cursor-pointer group">
                <input type="checkbox" name="privacy.showPhone" checked={formData.privacySettings.showPhone} onChange={handleChange} className="w-6 h-6 border-[2px] border-border rounded-none accent-foreground focus:ring-0 focus:ring-offset-0 bg-background checked:bg-foreground" />
                <span className="font-sans text-lg group-hover:text-muted-foreground transition-colors">Show phone number on profile</span>
              </label>
              <label className="flex items-center gap-4 cursor-pointer group">
                <input type="checkbox" name="privacy.showLocation" checked={formData.privacySettings.showLocation} onChange={handleChange} className="w-6 h-6 border-[2px] border-border rounded-none accent-foreground focus:ring-0 focus:ring-offset-0 bg-background checked:bg-foreground" />
                <span className="font-sans text-lg group-hover:text-muted-foreground transition-colors">Show location on profile</span>
              </label>
              <label className="flex items-center gap-4 cursor-pointer group">
                <input type="checkbox" name="privacy.showProfession" checked={formData.privacySettings.showProfession} onChange={handleChange} className="w-6 h-6 border-[2px] border-border rounded-none accent-foreground focus:ring-0 focus:ring-offset-0 bg-background checked:bg-foreground" />
                <span className="font-sans text-lg group-hover:text-muted-foreground transition-colors">Show profession on profile</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-6 pt-8 border-t-[4px] border-border">
            <button type="button" onClick={() => window.history.back()} className="btn btn-secondary px-8 border-[2px]">
              Cancel
            </button>
            <button type="submit" disabled={updateProfileMutation.isLoading} className="btn btn-primary flex items-center justify-center gap-3 px-12 py-4 disabled:opacity-50 border-[2px]">
              <Save size={18} />
              {updateProfileMutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
