import { useCallback, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Upload, X, ChevronDown, ChevronUp } from "lucide-react";
import { adminGalleryAPI } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MAX_FILES = 20;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];
const ACCEPTED_EXT = /\.(jpe?g|png|webp|gif|heic|heif)$/i;
const HEIC_EXT = /\.(heic|heif)$/i;

function isAcceptableFile(file) {
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXT.test(file.name);
}

function slugifyGalleryName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createFileEntry(file) {
  const isHeic = HEIC_EXT.test(file.name);
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    file,
    preview: isHeic ? null : URL.createObjectURL(file),
    isHeic,
    title: file.name.replace(/\.[^.]+$/, ""),
    description: "",
    expanded: false,
  };
}

export default function GalleryUploadPanel({
  galleryName: fixedGalleryName = "",
  lockGalleryName = false,
  onSuccess,
  onCancel,
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [galleryName, setGalleryName] = useState(fixedGalleryName);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const { data: foldersRes, isLoading: foldersLoading } = useQuery({
    queryKey: ["admin", "gallery", "folders"],
    queryFn: () => adminGalleryAPI.getFolders(),
    enabled: !lockGalleryName,
  });

  const folderOptions = foldersRes?.data?.folders ?? [];
  const activeGalleryName = lockGalleryName ? fixedGalleryName : galleryName;
  const gallerySlug = useMemo(
    () => slugifyGalleryName(activeGalleryName),
    [activeGalleryName],
  );

  const addFiles = useCallback((incoming) => {
    const imageFiles = [...incoming].filter(isAcceptableFile);

    if (!imageFiles.length) {
      toast.error("Please select valid image files (jpg, png, webp, gif, heic)");
      return;
    }

    let skippedDup = 0;
    let hitLimit = false;

    setFiles((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const next = [...prev];

      for (const file of imageFiles) {
        if (next.length >= MAX_FILES) {
          hitLimit = true;
          break;
        }
        const entry = createFileEntry(file);
        if (!existingIds.has(entry.id)) {
          next.push(entry);
          existingIds.add(entry.id);
        } else {
          skippedDup++;
        }
      }

      return next;
    });

    if (skippedDup > 0) {
      toast.info(`${skippedDup} duplicate(s) removed from selection`);
    }

    if (hitLimit || imageFiles.length > MAX_FILES) {
      toast.warning(
        `Only ${MAX_FILES} images per batch — upload in groups, duplicates are auto-skipped on server`,
      );
    }
  }, []);

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateFileMeta = (id, field, value) => {
    setFiles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const toggleExpanded = (id) => {
    setFiles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, expanded: !item.expanded } : item,
      ),
    );
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (lockGalleryName) {
        formData.append("gallerySlug", activeGalleryName.trim());
      } else {
        formData.append("galleryName", activeGalleryName.trim());
      }
      formData.append(
        "metadata",
        JSON.stringify(
          files.map(({ title, description }) => ({ title, description })),
        ),
      );
      files.forEach(({ file }) => formData.append("files", file));
      return adminGalleryAPI.uploadImages(formData);
    },
    onSuccess: (res) => {
      const count = res?.data?.uploadedCount ?? 0;
      const skipped = res?.data?.skippedCount ?? 0;
      const failed = res?.data?.failedCount ?? 0;

      toast.success(res?.message || `${count} image(s) uploaded`);

      if (skipped > 0) {
        toast.info(`${skipped} duplicate(s) skipped — already in this gallery`);
      }

      if (failed > 0) {
        const names = (res?.data?.errors ?? [])
          .map((e) => e.fileName)
          .slice(0, 3)
          .join(", ");
        toast.warning(
          `${failed} image(s) failed${names ? `: ${names}${failed > 3 ? "…" : ""}` : ""}`,
        );
      }

      // #region agent log
      fetch('http://127.0.0.1:7249/ingest/e2bd3e24-2d80-4a40-98be-8c57fba7031d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b2fc89'},body:JSON.stringify({sessionId:'b2fc89',location:'GalleryUploadPanel.jsx:onSuccess',message:'upload response',data:{count,skipped,failed,errors:res?.data?.errors},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
      // #endregion

      files.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ["gallery", "s3-feed"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery", "folders"] });
      onSuccess?.(res?.data);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const canUpload =
    gallerySlug.length > 0 && files.length > 0 && !uploadMutation.isPending;

  return (
    <div className="space-y-6">
      {!lockGalleryName ? (
        <div className="space-y-2">
          <Label htmlFor="galleryName">Gallery name</Label>
          <Input
            id="galleryName"
            list="gallery-folder-options"
            placeholder="e.g. Sports Day 2026"
            value={galleryName}
            onChange={(e) => setGalleryName(e.target.value)}
          />
          <datalist id="gallery-folder-options">
            {folderOptions.map((folder) => (
              <option key={folder.slug} value={folder.slug}>
                {folder.name}
              </option>
            ))}
          </datalist>
          {galleryName.trim() && (
            <p className="text-sm text-muted-foreground">
              S3 folder:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {gallerySlug || "(invalid name)"}
              </code>
            </p>
          )}
          {foldersLoading && (
            <p className="text-xs text-muted-foreground">Loading existing albums…</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Uploading to album:{" "}
          <span className="font-medium text-foreground">{fixedGalleryName}</span>
        </p>
      )}

      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        className={cn(
          "flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50",
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium">Drag & drop images here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse — jpg, png, webp, gif, heic — up to {MAX_FILES}{" "}
          images, 15 MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {files.length} image{files.length !== 1 ? "s" : ""} selected
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                files.forEach((item) => {
                  if (item.preview) URL.revokeObjectURL(item.preview);
                });
                setFiles([]);
              }}
            >
              Clear all
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-lg border bg-card"
              >
                <div className="relative aspect-video bg-muted">
                  {item.isHeic ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        HEIC
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Converts to WebP on upload
                      </p>
                    </div>
                  ) : (
                    <img
                      src={item.preview}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1 shadow"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-sm font-medium"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    Optional details
                    {item.expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {item.expanded && (
                    <div className="mt-3 space-y-2">
                      <Input
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) =>
                          updateFileMeta(item.id, "title", e.target.value)
                        }
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          updateFileMeta(item.id, "description", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={!canUpload}
          onClick={() => uploadMutation.mutate()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploadMutation.isPending
            ? "Uploading & optimizing…"
            : `Upload ${files.length || ""} image${files.length !== 1 ? "s" : ""}`}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {uploadMutation.isPending && (
          <p className="text-sm text-muted-foreground">
            Resizing, converting to WebP, and uploading to S3…
          </p>
        )}
      </div>
    </div>
  );
}
