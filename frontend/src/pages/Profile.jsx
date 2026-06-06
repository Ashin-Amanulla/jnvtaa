import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { usersAPI } from "@/api";
import { useBatches } from "@/hooks/useBatches";
import { useAuthStore } from "@/store/auth";
import AvatarUpload from "@/components/AvatarUpload";
import { Save, UserCircle, Camera, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBatchDisplayYear, getBatchId } from "@/utils/format";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const setupMode = searchParams.get("setup") === "1";
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    batch: "",
    rollNumber: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
    avatar: "",
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
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const {
    batches,
    isLoading: batchesLoading,
    isError: batchesError,
    error: batchesQueryError,
    refetch: refetchBatches,
  } = useBatches();
  const needsBatch = !getBatchId(user?.batch);
  const selectedBatchId = getBatchId(formData.batch);
  const batchSelectValue = batches.some(
    (batch) => getBatchId(batch) === selectedBatchId
  )
    ? selectedBatchId
    : undefined;

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        batch: getBatchId(user.batch),
        rollNumber: user.rollNumber || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
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
          showLocation: user.privacySettings?.showLocation ?? true,
          showProfession: user.privacySettings?.showProfession ?? true,
        },
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => usersAPI.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data.user);
      toast.success("Profile updated successfully");
      if (setupMode) {
        setSearchParams({}, { replace: true });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (avatar) => usersAPI.updateProfile({ avatar }),
    onSuccess: (response) => {
      updateUser(response.data.user);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save profile photo");
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

  const handleAvatarChange = (avatarUrl) => {
    setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
    avatarMutation.mutate(avatarUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (needsBatch && !formData.batch) {
      toast.error("Please select your batch to continue");
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  const isSaving = updateProfileMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
        <p className="text-sm text-muted-foreground">
          Keep your profile current so fellow Navodayans can connect with you.
        </p>
      </div>

      {(setupMode || needsBatch) && (
        <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-foreground">Complete your profile</p>
            <p className="mt-1 text-muted-foreground">
              Select your batch below so we can connect you with your classmates.
              {setupMode ? " This is required after signing in with Google." : ""}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-4 w-4" />
              Profile photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              name={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
              value={formData.avatar}
              onChange={handleAvatarChange}
              isUploading={isAvatarUploading || avatarMutation.isPending}
              onUploadingChange={setIsAvatarUploading}
            />
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
                <Input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>
                  Batch {needsBatch ? "*" : ""}
                </Label>
                <Select
                  value={batchSelectValue}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, batch: value }))
                  }
                  disabled={batchesLoading || batchesError}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        batchesLoading ? "Loading batches…" : "Select your batch"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => {
                      const batchId = getBatchId(batch);
                      return (
                        <SelectItem key={batchId} value={batchId}>
                          Batch of {getBatchDisplayYear(batch)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {batchesError && (
                  <div className="space-y-2">
                    <p className="text-xs text-destructive">
                      {batchesQueryError?.message ||
                        "Could not load batches. Please try again."}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => refetchBatches()}
                    >
                      Retry
                    </Button>
                  </div>
                )}
                {!batchesLoading && !batchesError && batches.length === 0 && (
                  <p className="text-xs text-destructive">
                    No batches available. Please contact an admin.
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rollNumber">Roll number (optional)</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length} / 500 characters
              </p>
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
                <Input
                  id="currentCity"
                  type="text"
                  name="currentCity"
                  value={formData.currentCity}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCountry">Country</Label>
                <Input
                  id="currentCountry"
                  type="text"
                  name="currentCountry"
                  value={formData.currentCountry}
                  onChange={handleChange}
                  placeholder="e.g. India"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Technology"
                />
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
              <Input
                id="linkedin"
                type="url"
                name="socialLinks.linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                name="socialLinks.facebook"
                value={formData.socialLinks.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/yourprofile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                type="url"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                name="socialLinks.instagram"
                value={formData.socialLinks.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="privacy.showEmail"
                checked={formData.privacySettings.showEmail}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Show email on profile</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="privacy.showPhone"
                checked={formData.privacySettings.showPhone}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Show phone number on profile</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="privacy.showLocation"
                checked={formData.privacySettings.showLocation}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Show location on profile</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="privacy.showProfession"
                checked={formData.privacySettings.showProfession}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Show profession on profile</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse justify-end gap-3 border-t pt-6 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || isAvatarUploading}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
