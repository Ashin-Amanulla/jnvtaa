import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Save, UserCircle, Camera, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
        <p className="text-sm text-muted-foreground">
          Keep your profile current so fellow Navodayans can connect with you.
        </p>
      </div>

      {success && (
        <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/10 p-4 text-sm">
          <span className="font-medium">Profile updated successfully</span>
          <CheckSquare className="h-5 w-5 text-primary" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-4 w-4" />
              Avatar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=128&background=000&color=fff`
                }
                alt={user?.firstName}
                className="h-24 w-24 rounded-full border object-cover"
              />
              <div>
                <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                  In production, you would be able to upload a new photo here.
                </p>
                <Button type="button" variant="outline" size="sm">
                  Change Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-4 w-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Batch</Label>
                <Input type="text" value={user?.batch?.year ? `Batch of ${user.batch.year}` : "Not set"} disabled className="bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} maxLength={500} placeholder="Tell us about yourself..." />
              <p className="text-xs text-muted-foreground">{formData.bio.length} / 500 characters</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Professional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentCity">Current City</Label>
                <Input id="currentCity" type="text" name="currentCity" value={formData.currentCity} onChange={handleChange} placeholder="e.g. Mumbai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCountry">Country</Label>
                <Input id="currentCountry" type="text" name="currentCountry" value={formData.currentCountry} onChange={handleChange} placeholder="e.g. India" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input id="profession" type="text" name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. Software Engineer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" type="text" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. Google" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. Technology" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" type="url" name="socialLinks.linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" type="url" name="socialLinks.facebook" value={formData.socialLinks.facebook} onChange={handleChange} placeholder="https://facebook.com/yourprofile" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input id="twitter" type="url" name="socialLinks.twitter" value={formData.socialLinks.twitter} onChange={handleChange} placeholder="https://twitter.com/yourhandle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" type="url" name="socialLinks.instagram" value={formData.socialLinks.instagram} onChange={handleChange} placeholder="https://instagram.com/yourhandle" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" name="privacy.showEmail" checked={formData.privacySettings.showEmail} onChange={handleChange} className="h-4 w-4 rounded border-input" />
              <span className="text-sm">Show email on profile</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" name="privacy.showPhone" checked={formData.privacySettings.showPhone} onChange={handleChange} className="h-4 w-4 rounded border-input" />
              <span className="text-sm">Show phone number on profile</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" name="privacy.showLocation" checked={formData.privacySettings.showLocation} onChange={handleChange} className="h-4 w-4 rounded border-input" />
              <span className="text-sm">Show location on profile</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" name="privacy.showProfession" checked={formData.privacySettings.showProfession} onChange={handleChange} className="h-4 w-4 rounded border-input" />
              <span className="text-sm">Show profession on profile</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse justify-end gap-3 border-t pt-6 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateProfileMutation.isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {updateProfileMutation.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
