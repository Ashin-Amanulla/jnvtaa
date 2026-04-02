import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, batchesAPI } from "@/api";
import AlumniCard from "@/components/AlumniCard";
import SearchBar from "@/components/SearchBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Filter, X } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b-[3px] border-dashed border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rotate-[-1deg] rounded-wobblySm border-2 border-border bg-white px-3 py-1 font-sans text-lg shadow-sketchSm">
            Find your people
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Directory
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Search by batch, city, or profession—like a yearbook with Ctrl+F.
          </p>
        </div>
      </section>

      <section className="sticky-below-nav py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            {/* Search Bar */}
            <div className="flex-1 w-full relative">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search by name, email, or profession..."
              />
            </div>

            {/* Filter Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline relative flex min-h-12 items-center justify-center gap-2 px-6 font-sans normal-case tracking-normal ${showFilters ? "border-[3px] border-border bg-foreground text-background shadow-sketch" : ""}`}
              >
                <Filter size={20} strokeWidth={2.5} />
                Filters
                {hasActiveFilters && !showFilters && (
                  <span className="absolute -right-2 -top-2 rounded-wobblySm border-2 border-border bg-accent px-2 py-0.5 font-sans text-xs font-bold text-white shadow-sketchSm">
                    On
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="relative mt-8 rounded-wobblyMd border-[3px] border-border border-dashed bg-muted p-8 shadow-sketchSm md:p-10">
              <h3 className="mb-6 font-display text-2xl font-bold">Filter alumni</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="label">Batch/Year</label>
                  <select
                    name="batch"
                    value={filters.batch}
                    onChange={handleFilterChange}
                    className="input bg-background"
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
                    className="input bg-background"
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
                    className="input bg-background"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-2 font-sans text-lg font-bold text-pen underline decoration-wavy decoration-2 underline-offset-4"
                  >
                    <X size={16} strokeWidth={2} />
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-20">
        <div className="container-custom">
          {/* Results Count */}
          <div className="mb-12 flex flex-col items-baseline justify-between gap-2 border-b-2 border-dashed border-border pb-4 md:flex-row">
            <p className="font-display text-2xl font-bold md:text-3xl">
              {usersData?.pagination?.total || 0}{" "}
              <span className="font-sans text-xl font-normal text-muted-foreground">
                alumni match
              </span>
            </p>
            {usersData?.pagination && (
              <p className="font-sans text-lg text-muted-foreground">
                Page {usersData.pagination.page} of{" "}
                {usersData.pagination.totalPages}
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && <LoadingSpinner />}

          {/* Alumni Grid */}
          {!isLoading && usersData?.data?.users?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {usersData.data.users.map((user) => (
                <AlumniCard key={user._id} user={user} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && usersData?.data?.users?.length === 0 && (
            <div className="rounded-wobblyMd border-[3px] border-dashed border-border py-24 text-center shadow-sketchSm">
              <Filter className="mx-auto mb-6 hidden text-muted-foreground md:block" size={64} strokeWidth={2} />
              <h3 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                Nobody matched
              </h3>
              <p className="mx-auto mb-8 max-w-md font-sans text-lg text-muted-foreground">
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-primary px-8">
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {usersData?.pagination && usersData.pagination.totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-4">
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                disabled={!usersData.pagination.hasPrevPage}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed border-[2px]"
              >
                Prev
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(Math.min(5, usersData.pagination.totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      type="button"
                      key={pageNum}
                      onClick={() => setFilters({ ...filters, page: pageNum })}
                      className={`h-12 min-w-[3rem] rounded-wobblySm border-[3px] font-sans text-lg transition-transform duration-100 ${
                        filters.page === pageNum
                          ? "border-border bg-foreground text-background shadow-sketch"
                          : "border-border bg-white text-foreground hover:-rotate-1"
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
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed border-[2px]"
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
