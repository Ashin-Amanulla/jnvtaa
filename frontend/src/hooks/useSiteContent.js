import { useQuery } from "@tanstack/react-query";
import { getSiteContent } from "@/api/siteContent";

export function useSiteContent(key, options = {}) {
  return useQuery({
    queryKey: ["siteContent", key],
    queryFn: () => getSiteContent(key),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
