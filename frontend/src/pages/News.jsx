import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsAPI } from "@/api";
import NewsCard from "@/components/NewsCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FaNewspaper } from "react-icons/fa";

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
        </div>

        <div className="container-custom text-center relative z-10 animate-fade-in">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <FaNewspaper className="text-4xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">News & Updates</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Stay informed about alumni achievements and school developments
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  category === cat.value
                    ? "bg-primary-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && newsData?.data?.news?.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                {newsData.data.news.map((article, index) => (
                  <div
                    key={article._id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {newsData.pagination && newsData.pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!newsData.pagination.hasPrevPage}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="text-gray-600">
                    Page {page} of {newsData.pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!newsData.pagination.hasNextPage}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && newsData?.data?.news?.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaNewspaper className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No news articles found
              </h3>
              <p className="text-gray-600">
                Check back later for updates from the alumni community!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

