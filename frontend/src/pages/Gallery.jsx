import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { galleryAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Image as ImageIcon, Play, X } from "lucide-react";

export default function Gallery() {
  const [category, setCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);

  const { data: galleryData, isLoading } = useQuery({
    queryKey: ["gallery", category, page],
    queryFn: () => galleryAPI.getAll({ category, page, limit: 12 }),
  });

  const categories = [
    { value: "", label: "All" },
    { value: "event", label: "Events" },
    { value: "batch", label: "Batch Photos" },
    { value: "campus", label: "Campus" },
    { value: "achievement", label: "Achievements" },
    { value: "reunion", label: "Reunions" },
  ];

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
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={`min-h-12 rounded-wobblySm border-[3px] px-5 py-2 font-sans text-lg shadow-sketchSm transition-transform duration-100 focus-ring ${
                  category === cat.value
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

          {!isLoading && galleryData?.data?.items?.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {galleryData.data.items.map((item, i) => (
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
          )}

          {/* Empty State */}
          {!isLoading && galleryData?.data?.items?.length === 0 && (
            <div className="rounded-wobblyMd border-[3px] border-dashed border-border py-24 text-center shadow-sketchSm">
              <ImageIcon className="mx-auto mb-6 hidden text-muted-foreground md:block" size={64} strokeWidth={2} />
              <h3 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                Empty album
              </h3>
              <p className="mx-auto max-w-md font-sans text-lg text-muted-foreground">
                Be the first to share your memories!
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
