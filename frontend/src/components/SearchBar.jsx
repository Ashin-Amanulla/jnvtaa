import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch, placeholder = "Search..." }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <label htmlFor="search-bar" className="sr-only">
        Search
      </label>
      <div className="relative">
        <input
          id="search-bar"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="input w-full pl-12 pr-4"
        />
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={22}
          strokeWidth={2.5}
          aria-hidden
        />
      </div>
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
