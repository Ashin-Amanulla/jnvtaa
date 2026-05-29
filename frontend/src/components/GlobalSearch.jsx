import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Command } from "cmdk";
import { Search, User, Calendar, Newspaper, Briefcase } from "lucide-react";
import { searchAPI } from "@/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data, isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchAPI.global(query),
    enabled: query.trim().length >= 2,
  });

  const results = data?.data?.results;

  const onKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((o) => !o);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const go = (path) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const hasResults =
    results &&
    (results.users?.length ||
      results.events?.length ||
      results.news?.length ||
      results.jobs?.length);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 font-sans text-base text-muted-foreground shadow-card focus-ring  lg:inline-flex"
        aria-label="Search (Cmd+K)"
      >
        <Search size={18} strokeWidth={2} />
        <span>Search</span>
        <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl overflow-hidden rounded-2xl border border-border p-0 shadow-card">
          <DialogTitle className="sr-only">Global search</DialogTitle>
          <Command className="bg-white" shouldFilter={false}>
            <div className="flex items-center border-b border-border px-4">
              <Search className="mr-2 shrink-0 text-muted-foreground" size={20} />
              <Command.Input
                placeholder="Search alumni, events, news, jobs…"
                value={query}
                onValueChange={setQuery}
                className="flex h-14 w-full bg-transparent font-sans text-lg outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              {query.trim().length < 2 && (
                <Command.Empty className="py-8 text-center font-sans text-muted-foreground">
                  Type at least 2 characters to search
                </Command.Empty>
              )}
              {query.trim().length >= 2 && isFetching && (
                <Command.Empty className="py-8 text-center font-sans text-muted-foreground">
                  Searching…
                </Command.Empty>
              )}
              {query.trim().length >= 2 && !isFetching && !hasResults && (
                <Command.Empty className="py-8 text-center font-sans text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </Command.Empty>
              )}

              {results?.users?.length > 0 && (
                <Command.Group
                  heading="Alumni"
                  className="px-2 py-2 font-sans text-sm font-bold uppercase tracking-wide text-muted-foreground"
                >
                  {results.users.map((u) => (
                    <Command.Item
                      key={u._id}
                      value={`user-${u._id}`}
                      onSelect={() => go(`/alumni/${u._id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 font-sans text-base aria-selected:bg-muted"
                    >
                      <User size={18} />
                      {u.firstName} {u.lastName}
                      {u.profession && (
                        <span className="text-muted-foreground">· {u.profession}</span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results?.events?.length > 0 && (
                <Command.Group heading="Events" className="px-2 py-2 font-sans text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {results.events.map((e) => (
                    <Command.Item
                      key={e._id}
                      value={`event-${e._id}`}
                      onSelect={() => go(`/events/${e._id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 font-sans text-base aria-selected:bg-muted"
                    >
                      <Calendar size={18} />
                      {e.title}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results?.news?.length > 0 && (
                <Command.Group heading="News" className="px-2 py-2 font-sans text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {results.news.map((n) => (
                    <Command.Item
                      key={n._id}
                      value={`news-${n._id}`}
                      onSelect={() => go(`/news/${n._id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 font-sans text-base aria-selected:bg-muted"
                    >
                      <Newspaper size={18} />
                      {n.title}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results?.jobs?.length > 0 && (
                <Command.Group heading="Jobs" className="px-2 py-2 font-sans text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {results.jobs.map((j) => (
                    <Command.Item
                      key={j._id}
                      value={`job-${j._id}`}
                      onSelect={() => go(`/jobs/${j._id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 font-sans text-base aria-selected:bg-muted"
                    >
                      <Briefcase size={18} />
                      {j.title} · {j.company}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
