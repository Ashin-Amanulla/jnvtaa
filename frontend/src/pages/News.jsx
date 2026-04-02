import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsAPI } from "@/api";
import NewsCard from "@/components/NewsCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Newspaper } from "lucide-react";

export default function News() {
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news", category, page],
    queryFn: () => newsAPI.getAll({ category, page, limit: 9 }),
  });

  const categories = [
    { value: "", label: "All News" },
    { value: "achievement", label: "Achievements" },
    { value: "event", label: "Events" },
    { value: "announcement", label: "Announcements" },
    { value: "alumni_story", label: "Alumni Stories" },
    { value: "school_update", label: "School Updates" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b-[3px] border-dashed border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rotate-1 rounded-wobblySm border-2 border-border bg-postit px-3 py-1 font-sans text-lg shadow-sketchSm">
            Bulletin board
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            News
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Wins, updates, and stories that deserve a highlight marker.
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

      {/* News Grid */}
      <section className="py-20">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && newsData?.data?.news?.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsData.data.news.map((article) => (
                  <NewsCard key={article._id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {newsData.pagination && newsData.pagination.totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-6">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!newsData.pagination.hasPrevPage}
                    className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="font-sans text-lg text-muted-foreground">
                    Page {page} of {newsData.pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!newsData.pagination.hasNextPage}
                    className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && newsData?.data?.news?.length === 0 && (
            <div className="rounded-wobblyMd border-[3px] border-dashed border-border py-24 text-center shadow-sketchSm">
              <Newspaper className="mx-auto mb-6 hidden text-muted-foreground md:block" size={64} strokeWidth={2} />
              <h3 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                No articles yet
              </h3>
              <p className="mx-auto max-w-md font-sans text-lg text-muted-foreground">
                Check back later for updates from the alumni community.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
