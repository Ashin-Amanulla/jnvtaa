import { useQuery } from "@tanstack/react-query";
import { batchesAPI } from "@/api";
import { QUERY_KEYS, STALE_TIME, BATCH_LIST_PARAMS } from "@/api/queryKeys";
import { shouldRetryQuery } from "@/utils/queryRetry";

export const getBatchesFromResponse = (data) => data?.data?.batches ?? [];

export function useBatches() {
  const query = useQuery({
    queryKey: QUERY_KEYS.batches(BATCH_LIST_PARAMS),
    queryFn: () => batchesAPI.getAll(BATCH_LIST_PARAMS),
    staleTime: STALE_TIME.BATCHES,
    retry: shouldRetryQuery,
    refetchOnMount: (query) =>
      getBatchesFromResponse(query.state.data).length === 0,
  });

  return {
    ...query,
    batches: getBatchesFromResponse(query.data),
  };
}
