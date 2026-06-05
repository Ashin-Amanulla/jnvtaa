import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { galleryAPI } from "@/api";
import { STALE_TIME } from "@/api/queryKeys";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play, X } from "lucide-react";

const PAGE_SIZE = 12;

function GalleryThumb({ item }) {
  const [src, setSrc] = useState(item.thumbnail || item.url);
  const handleError = useCallback(() => {
    if (src !== item.url) setSrc(item.url);
  }, [src, item.url]);

  return (
    <img
      src={src}
      alt={item.title}
      className="h-full w-full object-cover transition-transform duration-100 group-hover:scale-[1.03]"
      onError={handleError}
    />
  );
}

export default function Gallery() {
  const [folderId, setFolderId] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [page, setPage] = useState(1);

  const {
    data: feedRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["gallery", "s3-feed"],
    queryFn: () => galleryAPI.getS3Feed(),
    staleTime: STALE_TIME.GALLERY,
  });

  const allItems = feedRes?.data?.items ?? [];
  const folderOptions = feedRes?.data?.folders ?? [];

  const categoryButtons = useMemo(
    () => [
      { value: "", label: "All" },
      ...folderOptions.map((f) => ({
        value: f.id,
        label: f.name,
      })),
    ],
    [folderOptions],
  );

  const filteredItems = useMemo(() => {
    if (!folderId) return allItems;
    return allItems.filter((i) => i.folderId === folderId);
  }, [allItems, folderId]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const p = Math.min(Math.max(1, page), totalPages);
    const start = (p - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page, totalPages]);

  const selectedItem =
    selectedIndex !== null ? filteredItems[selectedIndex] : null;
  const hasPrev = selectedIndex !== null && selectedIndex > 0;
  const hasNext =
    selectedIndex !== null && selectedIndex < filteredItems.length - 1;

  const openLightbox = useCallback(
    (item) => {
      const index = filteredItems.findIndex((i) => i._id === item._id);
      if (index >= 0) setSelectedIndex(index);
    },
    [filteredItems],
  );

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  const goPrev = useCallback(() => {
    setSelectedIndex((idx) => (idx !== null && idx > 0 ? idx - 1 : idx));
  }, []);

  const goNext = useCallback(() => {
    setSelectedIndex((idx) =>
      idx !== null && idx < filteredItems.length - 1 ? idx + 1 : idx,
    );
  }, [filteredItems.length]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, closeLightbox, goPrev, goNext]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rounded-xl border border-border bg-white px-3 py-1 font-sans text-lg shadow-card">
            Campus memories
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Gallery
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Sports days, batch photographs, reunions, and moments from JNV
            Thiruvananthapuram — shared by our alumni community.
          </p>
        </div>
      </section>

      <section className="sticky-below-nav py-6">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3">
            {categoryButtons.map((cat) => (
              <button
                key={cat.value || "all"}
                type="button"
                onClick={() => {
                  setFolderId(cat.value);
                  setPage(1);
                }}
                className={`min-h-12 rounded-xl border-[3px] px-5 py-2 font-sans text-lg shadow-card transition-transform duration-100 focus-ring ${
                  folderId === cat.value
                    ? "border-border bg-brand text-white"
                    : "border-border bg-white text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {isError && (
            <div className="rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-card">
              <h3 className="mb-3 font-display text-2xl font-bold md:text-3xl">
                Couldn&apos;t load album
              </h3>
              <p className="mx-auto max-w-lg font-sans text-lg text-muted-foreground">
                {error?.message ||
                  "The gallery service may be busy. Try again in a moment."}
              </p>
            </div>
          )}

          {!isLoading && !isError && paginatedItems.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {paginatedItems.map((item, i) => (
                  <div
                    key={item._id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openLightbox(item);
                      }
                    }}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-border bg-muted shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cardHover"
                    onClick={() => openLightbox(item)}
                  >
                    <GalleryThumb item={item} />
                    <div className="absolute inset-0 flex flex-col justify-end bg-foreground/85 p-4 opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                      <h4 className="font-display text-xl font-bold text-background line-clamp-2">
                        {item.title}
                      </h4>
                      {item.folderName && (
                        <p className="mt-1 font-sans text-sm text-background/80">
                          {item.folderName}
                        </p>
                      )}
                      {item.uploadedBy && (
                        <p className="mt-1 font-sans text-sm text-background/80">
                          By {item.uploadedBy.firstName}
                        </p>
                      )}
                    </div>
                    {item.type === "video" && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-white text-foreground shadow-card">
                          <Play size={24} strokeWidth={2} className="ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="min-h-12 rounded-xl border border-border bg-white px-6 py-2 font-sans text-lg shadow-card focus-ring disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="font-sans text-lg text-muted-foreground">
                    Page {Math.min(page, totalPages)} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="min-h-12 rounded-xl border border-border bg-white px-6 py-2 font-sans text-lg shadow-card focus-ring disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && !isError && filteredItems.length === 0 && (
            <div className="rounded-2xl border border-border py-24 text-center shadow-card">
              <ImageIcon
                className="mx-auto mb-6 hidden text-muted-foreground md:block"
                size={64}
                strokeWidth={2}
              />
              <h3 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                Empty album
              </h3>
              <p className="mx-auto max-w-md font-sans text-lg text-muted-foreground">
                No photos in this folder yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery lightbox"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-xl border-2 border-white/20 bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-ring md:right-6 md:top-6"
          >
            <X size={28} strokeWidth={2} />
            <span className="sr-only">Close</span>
          </button>

          {hasPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-xl border-2 border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-ring md:left-6"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} strokeWidth={2} />
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-xl border-2 border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-ring md:right-6"
              aria-label="Next image"
            >
              <ChevronRight size={32} strokeWidth={2} />
            </button>
          )}

          <div
            className="flex w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={selectedItem._id}
              src={selectedItem.url || selectedItem.thumbnail}
              alt={selectedItem.title}
              className="max-h-[75vh] w-full object-contain"
            />
            <div className="mt-6 w-full text-center text-white">
              <p className="font-sans text-sm text-white/60">
                {selectedIndex + 1} of {filteredItems.length}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                {selectedItem.title}
              </h3>
              {selectedItem.folderName && (
                <p className="mt-1 font-sans text-base text-white/75">
                  {selectedItem.folderName}
                </p>
              )}
              {selectedItem.description && (
                <p className="mx-auto mt-2 max-w-2xl font-sans text-base text-white/80">
                  {selectedItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
