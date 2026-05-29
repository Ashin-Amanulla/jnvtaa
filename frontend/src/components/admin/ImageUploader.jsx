import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminUploadsAPI } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ImageUploader({
  value,
  onChange,
  folder = "uploads",
  className,
  label = "Upload image",
}) {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      const signed = await adminUploadsAPI.sign({
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
        throw new Error("Failed to upload file to storage");
      }

      onChange?.(publicUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Upload preview"
            className="h-32 w-auto rounded-md border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-7 w-7"
            onClick={() => onChange?.("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {label}
        </Button>
      </div>
    </div>
  );
}
