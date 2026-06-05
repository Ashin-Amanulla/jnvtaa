import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  FolderOpen,
  ImagePlus,
  Plus,
  Trash2,
} from "lucide-react";
import { adminGalleryAPI } from "@/api/admin";
import GalleryUploadPanel from "@/admin/components/GalleryUploadPanel";
import DataTable from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/format";

function galleryPath(slug) {
  return `/admin/gallery/${encodeURIComponent(slug)}`;
}

function GalleryImage({ image, onDelete, isDeleting }) {
  const [src, setSrc] = useState(image.thumbnailUrl || image.url);

  return (
    <div className="group overflow-hidden rounded-lg border bg-card">
      <div className="relative aspect-square bg-muted">
        <img
          src={src}
          alt={image.title || image.name}
          className="h-full w-full object-cover"
          onError={() => {
            if (src !== image.url) setSrc(image.url);
          }}
        />
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => {
            if (
              window.confirm(
                `Delete "${image.title || image.name}" from this gallery?`,
              )
            ) {
              onDelete(image.key);
            }
          }}
          className="absolute right-2 top-2 rounded-md bg-destructive p-2 text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 disabled:opacity-50"
          aria-label="Delete image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium">
          {image.title || image.name}
        </p>
        {image.lastModified && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(image.lastModified, "PP")}
          </p>
        )}
      </div>
    </div>
  );
}

export default function GalleryAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: slugParam } = useParams();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);

  const isCreate =
    location.pathname.endsWith("/gallery/new") || slugParam === "new";
  const gallerySlug =
    slugParam && !isCreate ? decodeURIComponent(slugParam) : null;

  const { data: foldersRes, isLoading: foldersLoading } = useQuery({
    queryKey: ["admin", "gallery", "folders"],
    queryFn: () => adminGalleryAPI.getFolders(),
  });

  const galleries = foldersRes?.data?.folders ?? [];

  const selectedGallery = useMemo(() => {
    if (!gallerySlug) return null;
    return (
      galleries.find((g) => g.slug === gallerySlug) || {
        slug: gallerySlug,
        name: gallerySlug,
        imageCount: 0,
      }
    );
  }, [gallerySlug, galleries]);

  const {
    data: imagesRes,
    isLoading: imagesLoading,
    isError: imagesError,
    error: imagesErrorObj,
  } = useQuery({
    queryKey: ["admin", "gallery", "images", gallerySlug],
    queryFn: () => adminGalleryAPI.getFolderImages(gallerySlug),
    enabled: !!gallerySlug,
  });

  const images = imagesRes?.data?.images ?? [];

  const deleteMutation = useMutation({
    mutationFn: (key) => adminGalleryAPI.deleteS3Image(key),
    onSuccess: () => {
      toast.success("Image deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", "s3-feed"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const openGallery = (gallery) => {
    setShowUpload(false);
    navigate(galleryPath(gallery.slug));
  };

  const openCreateGallery = () => {
    setShowUpload(true);
    navigate("/admin/gallery/new");
  };

  const backToList = () => {
    setShowUpload(false);
    navigate("/admin/gallery");
  };

  const galleryColumns = [
    {
      accessorKey: "coverUrl",
      header: "Cover",
      cell: ({ row }) =>
        row.original.coverUrl ? (
          <img
            src={row.original.coverUrl}
            alt=""
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
        ),
    },
    {
      accessorKey: "name",
      header: "Gallery",
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium text-left hover:underline"
          onClick={() => openGallery(row.original)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: "imageCount",
      header: "Images",
      cell: ({ row }) => row.original.imageCount ?? 0,
    },
    {
      accessorKey: "lastModified",
      header: "Last updated",
      cell: ({ row }) =>
        row.original.lastModified
          ? formatDate(row.original.lastModified, "PP")
          : "—",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => openGallery(row.original)}>
          Manage
        </Button>
      ),
    },
  ];

  if (isCreate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={backToList}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">New gallery</h1>
            <p className="text-sm text-muted-foreground">
              Name the album and upload your first images.
            </p>
          </div>
        </div>
        <GalleryUploadPanel
          onSuccess={(data) => {
            const newSlug = data?.gallerySlug;
            if (newSlug) {
              navigate(galleryPath(newSlug));
            } else {
              backToList();
            }
          }}
          onCancel={backToList}
        />
      </div>
    );
  }

  if (gallerySlug && selectedGallery) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={backToList}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              All galleries
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{selectedGallery.name}</h1>
              <p className="text-sm text-muted-foreground">
                {images.length} image{images.length !== 1 ? "s" : ""} in this album
              </p>
            </div>
          </div>
          <Button type="button" onClick={() => setShowUpload((v) => !v)}>
            <ImagePlus className="mr-2 h-4 w-4" />
            {showUpload ? "Hide upload" : "Add images"}
          </Button>
        </div>

        {showUpload && (
          <div className="rounded-lg border bg-card p-4">
            <GalleryUploadPanel
              galleryName={selectedGallery.slug}
              lockGalleryName
              onSuccess={() => {
                setShowUpload(false);
                queryClient.invalidateQueries({
                  queryKey: ["admin", "gallery", "images", gallerySlug],
                });
                queryClient.invalidateQueries({ queryKey: ["admin", "gallery", "folders"] });
                queryClient.invalidateQueries({ queryKey: ["gallery", "s3-feed"] });
              }}
            />
          </div>
        )}

        {imagesLoading && (
          <p className="text-sm text-muted-foreground">Loading images…</p>
        )}

        {imagesError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {imagesErrorObj?.message || "Failed to load gallery images."}
          </div>
        )}

        {!imagesLoading && !imagesError && images.length === 0 && (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <p className="text-muted-foreground">No images in this gallery yet.</p>
            <Button type="button" className="mt-4" onClick={() => setShowUpload(true)}>
              <ImagePlus className="mr-2 h-4 w-4" />
              Add images
            </Button>
          </div>
        )}

        {!imagesLoading && !imagesError && images.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <GalleryImage
                key={image.key}
                image={image}
                isDeleting={deleteMutation.isPending}
                onDelete={(key) => deleteMutation.mutate(key)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Manage S3 photo albums shown on the public gallery page.
          </p>
        </div>
        <Button type="button" onClick={openCreateGallery}>
          <Plus className="mr-2 h-4 w-4" />
          Add gallery
        </Button>
      </div>

      <DataTable
        columns={galleryColumns}
        data={galleries}
        isLoading={foldersLoading}
        searchKey="name"
        searchPlaceholder="Search galleries…"
        emptyMessage="No galleries yet. Create one to get started."
      />
    </div>
  );
}
