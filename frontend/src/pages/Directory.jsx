import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, batchesAPI } from "@/api";
import AlumniCard from "@/components/AlumniCard";
import SearchBar from "@/components/SearchBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FaFilter, FaTimes } from "react-icons/fa";

export default function Directory() {
  const [filters, setFilters] = useState({
    search: "",
    batch: "",
    currentCity: "",
    profession: "",
    page: 1,
    limit: 12,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersAPI.getAllUsers(filters),
  });

  const { data: batchesData } = useQuery({
    queryKey: ["batches"],
    queryFn: () => batchesAPI.getAll({ limit: 100 }),
  });

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      batch: "",
      currentCity: "",
      profession: "",
      page: 1,
      limit: 12,
    });
  };

  const hasActiveFilters = filters.search || filters.batch || filters.currentCity || filters.profession;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">Alumni Directory</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Connect with fellow JNV Trivandrum alumni across the globe
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search by name, email, or profession..."
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center justify-center gap-2"
            >
              <FaFilter />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Batch/Year</label>
                  <select
                    name="batch"
                    value={filters.batch}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">All Batches</option>
                    {batchesData?.data?.batches?.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        Batch of {batch.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    name="currentCity"
                    value={filters.currentCity}
                    onChange={handleFilterChange}
                    placeholder="Enter city..."
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Profession</label>
                  <input
                    type="text"
                    name="profession"
                    value={filters.profession}
                    onChange={handleFilterChange}
                    placeholder="Enter profession..."
                    className="input"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                  >
                    <FaTimes />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-12">
        <div className="container-custom">
          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              {usersData?.pagination?.total || 0} alumni found
            </p>
            {usersData?.pagination && (
              <p className="text-sm text-gray-500">
                Page {usersData.pagination.page} of {usersData.pagination.totalPages}
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && <LoadingSpinner />}

          {/* Alumni Grid */}
          {!isLoading && usersData?.data?.users?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {usersData.data.users.map((user, index) => (
                <div
                  key={user._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <AlumniCard user={user} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && usersData?.data?.users?.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFilter className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No alumni found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {usersData?.pagination && usersData.pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                disabled={!usersData.pagination.hasPrevPage}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(Math.min(5, usersData.pagination.totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setFilters({ ...filters, page: pageNum })}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        filters.page === pageNum
                          ? "bg-primary-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
                disabled={!usersData.pagination.hasNextPage}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

