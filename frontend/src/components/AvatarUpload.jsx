import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadsAPI } from "@/api/uploads";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 5;

export default function AvatarUpload({
  name = "User",
  value,
  onChange,
  isUploading = false,
  onUploadingChange,
  folder = "avatars",
  className,
}) {
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, or WebP)");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB`);
      return;
    }

    onUploadingChange?.(true);
    try {
      const signed = await uploadsAPI.sign({
        fileName: file.name,
        contentType: file.type,
        folder,
      });

      const { uploadUrl, publicUrl } = signed.data;

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload photo");
      }

      onChange?.(publicUrl);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.message || "Photo upload failed");
    } finally {
      onUploadingChange?.(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const previewUrl =
    value ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=000&color=fff`;

  return (
    <div className={cn("flex flex-col items-start gap-4 sm:flex-row sm:items-center", className)}>
      <div className="relative">
        <img
          src={previewUrl}
          alt="Profile"
          className={cn(
            "h-24 w-24 rounded-full border object-cover",
            isUploading && "opacity-60",
          )}
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="max-w-sm text-sm text-muted-foreground">
          Upload a square photo. JPG, PNG, or WebP up to {MAX_SIZE_MB}MB.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Change photo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
