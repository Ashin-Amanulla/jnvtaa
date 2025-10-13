import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { galleryAPI } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FaImage, FaPlay, FaTimes } from "react-icons/fa";

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>

        <div className="container-custom text-center relative z-10 animate-fade-in">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <FaImage className="text-4xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Gallery</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Relive cherished memories from our JNV days
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
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

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading && <LoadingSpinner />}

          {!isLoading && galleryData?.data?.items?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
              {galleryData.data.items.map((item, index) => (
                <div
                  key={item._id}
                  className="group cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                          {item.title}
                        </h4>
                        {item.uploadedBy && (
                          <p className="text-white/80 text-xs">
                            by {item.uploadedBy.firstName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Video Icon */}
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FaPlay className="text-primary-600 text-xl ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && galleryData?.data?.items?.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaImage className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No gallery items found
              </h3>
              <p className="text-gray-600">
                Be the first to share your memories!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <FaTimes size={32} />
          </button>

          <div
            className="max-w-5xl w-full animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedItem.url}
              alt={selectedItem.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">{selectedItem.title}</h3>
              {selectedItem.description && (
                <p className="text-gray-300">{selectedItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

