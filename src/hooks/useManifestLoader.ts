import { queryOptions } from "@tanstack/react-query";

import { loadManifest } from "@/services/manifest/loader";

/**
 * Query options for manifest loading with proper caching.
 * - staleTime: 10 minutes - won't refetch if data is less than 10 minutes old
 * - gcTime: 30 minutes - keeps data in cache for 30 minutes after last use
 *
 * Use this with ensureQueryData in route loaders:
 * ```
 * loader: async ({ context }) => {
 *   await context.queryClient.ensureQueryData(manifestQueryOptions);
 * }
 * ```
 */
export const manifestQueryOptions = queryOptions({
  queryKey: ["manifest-init"],
  queryFn: loadManifest,
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  retry: 2,
  refetchOnWindowFocus: false,
});
