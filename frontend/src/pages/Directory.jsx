import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, batchesAPI } from "@/api";
import AlumniCard from "@/components/AlumniCard";
import SearchBar from "@/components/SearchBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getBatchDisplayYear } from "@/utils/format";
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

  const hasActiveFilters =
    filters.search || filters.batch || filters.currentCity || filters.profession;

  const batches = batchesData?.data?.batches ?? [];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative border-b border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rounded-xl border-2 border-border bg-white px-3 py-1 font-sans text-lg shadow-card">
            Alumni network
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Directory
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Search by batch, city, or profession to reconnect with fellow
            Navodayans from JNV Thiruvananthapuram.
          </p>
        </div>
      </section>

      <section className="sticky-below-nav py-8">
        <div className="container-custom">
          <div className="flex flex-col items-end gap-6 md:flex-row">
            <div className="relative w-full flex-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search by name, email, or profession..."
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline relative flex min-h-12 items-center justify-center gap-2 px-6 font-sans normal-case tracking-normal ${showFilters ? "border border-border bg-brand text-white shadow-card" : ""}`}
              >
                <Filter size={20} strokeWidth={2} />
                Filters
                {hasActiveFilters && !showFilters && (
                  <span className="absolute -right-2 -top-2 rounded-xl border-2 border-border bg-accent px-2 py-0.5 font-sans text-xs font-bold text-white shadow-card">
                    On
                  </span>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="relative mt-8 rounded-2xl border border-border bg-muted p-8 shadow-card md:p-10">
              <h3 className="mb-6 font-display text-2xl font-bold">Filter alumni</h3>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div>
                  <label className="label">Batch/Year</label>
                  <select
                    name="batch"
                    value={filters.batch}
                    onChange={handleFilterChange}
                    className="input bg-background"
                  >
                    <option value="">All Batches</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        Batch of {getBatchDisplayYear(batch)}
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
                    className="flex items-center gap-2 font-sans text-lg font-bold text-brand font-medium"
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

      <section className="py-20">
        <div className="container-custom">
          <div className="mb-12 flex flex-col items-baseline justify-between gap-2 border-b border-border pb-4 md:flex-row">
            <p className="font-display text-2xl font-bold md:text-3xl">
              {usersData?.pagination?.total || 0}{" "}
              <span className="font-sans text-xl font-normal text-muted-foreground">
                alumni match
              </span>
            </p>
            {usersData?.pagination && (
              <p className="font-sans text-lg text-muted-foreground">
                Page {usersData.pagination.page} of {usersData.pagination.totalPages}
              </p>
            )}
          </div>

          {isLoading && <LoadingSpinner />}

          {!isLoading && usersData?.data?.users?.length > 0 && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {usersData.data.users.map((user) => (
                <AlumniCard key={user._id} user={user} />
              ))}
            </div>
          )}

          {!isLoading && usersData?.data?.users?.length === 0 && (
            <div className="rounded-2xl border border-border py-24 text-center shadow-card">
              <Filter className="mx-auto mb-6 hidden text-muted-foreground md:block" size={64} strokeWidth={2} />
              <h3 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                No alumni found
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

          {usersData?.pagination && usersData.pagination.totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-4">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={!usersData.pagination.hasPrevPage}
                className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-50 border-[2px]"
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
                      className={`h-12 min-w-[3rem] rounded-xl border-[3px] font-sans text-lg transition-transform duration-100 ${
                        filters.page === pageNum
                          ? "border-border bg-brand text-white shadow-card"
                          : "border-border bg-white text-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={!usersData.pagination.hasNextPage}
                className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-50 border-[2px]"
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
