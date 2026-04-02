import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { galleryAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Image as ImageIcon, Play, X } from "lucide-react";

const PAGE_SIZE = 12;

export default function Gallery() {
  const [folderId, setFolderId] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);

  const {
    data: feedRes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["gallery", "s3-feed"],
    queryFn: () => galleryAPI.getS3Feed(),
    staleTime: 60_000,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b-[3px] border-dashed border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rotate-[-1deg] rounded-wobblySm border-2 border-border bg-white px-3 py-1 font-sans text-lg shadow-sketchSm">
            Photo pile
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Gallery
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Sweaty sports days, batch photos, and reunion chaos—pinned with love.
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
                className={`min-h-12 rounded-wobblySm border-[3px] px-5 py-2 font-sans text-lg shadow-sketchSm transition-transform duration-100 focus-ring ${
                  folderId === cat.value
                    ? "border-border bg-foreground text-background"
                    : "border-border bg-white text-foreground hover:-rotate-1"
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
            <div className="rounded-wobblyMd border-[3px] border-dashed border-border bg-white px-6 py-12 text-center shadow-sketchSm">
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
                        setSelectedItem(item);
                      }
                    }}
                    className={`group relative aspect-square cursor-pointer overflow-hidden border-[3px] border-border bg-muted shadow-sketchSm transition-transform duration-100 hover:-rotate-1 hover:shadow-sketch ${
                      i % 3 === 1 ? "md:translate-y-2" : ""
                    }`}
                    style={{
                      borderRadius:
                        i % 2 === 0
                          ? "255px 15px 225px 15px / 15px 225px 15px 255px"
                          : "15px 255px 15px 225px / 225px 15px 255px 15px",
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-100 group-hover:scale-[1.03]"
                    />
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
                        <div className="flex h-14 w-14 items-center justify-center rounded-wobblySm border-[3px] border-border bg-white text-foreground shadow-sketch">
                          <Play size={24} strokeWidth={2.5} className="ml-0.5" />
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
                    className="min-h-12 rounded-wobblySm border-[3px] border-border bg-white px-6 py-2 font-sans text-lg shadow-sketchSm focus-ring enabled:hover:-rotate-1 disabled:opacity-40"
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
                    className="min-h-12 rounded-wobblySm border-[3px] border-border bg-white px-6 py-2 font-sans text-lg shadow-sketchSm focus-ring enabled:hover:-rotate-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && !isError && filteredItems.length === 0 && (
            <div className="rounded-wobblyMd border-[3px] border-dashed border-border py-24 text-center shadow-sketchSm">
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

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 p-4"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery item"
        >
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="absolute right-6 top-6 rounded-wobblySm border-2 border-background bg-background px-3 py-2 text-foreground shadow-sketch focus-ring"
          >
            <X size={28} strokeWidth={2.5} />
            <span className="sr-only">Close</span>
          </button>

          <div
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedItem.url}
              alt={selectedItem.title}
              className="max-h-[80vh] w-full border-[3px] border-background object-contain shadow-[8px_8px_0_0_#fdfbf7]"
            />
            <div className="mt-8 text-left text-background">
              <h3 className="font-display text-3xl font-bold md:text-4xl">
                {selectedItem.title}
              </h3>
              {selectedItem.folderName && (
                <p className="mt-2 font-sans text-lg text-background/80">
                  {selectedItem.folderName}
                </p>
              )}
              {selectedItem.description && (
                <p className="mt-3 max-w-2xl font-sans text-lg text-background/85">
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
