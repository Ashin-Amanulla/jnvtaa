import { useQuery } from "@tanstack/react-query";
import { getSiteContent } from "@/api/siteContent";
import { QUERY_KEYS, STALE_TIME } from "@/api/queryKeys";

export function useSiteContent(key, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.siteContent(key),
    queryFn: () => getSiteContent(key),
    staleTime: STALE_TIME.SITE_CONTENT,
    ...options,
  });
}
