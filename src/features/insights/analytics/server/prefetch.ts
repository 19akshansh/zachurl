import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.analytics.getMany>;
type GetStatsInput = inferInput<typeof trpc.analytics.getStats>;

export const prefetchAnalyticsList = (params: GetManyInput) => {
  return prefetch(trpc.analytics.getMany.queryOptions(params));
};

export const prefetchAnalytic = (urlId: string) => {
  return prefetch(trpc.analytics.getOne.queryOptions({ urlId }));
};

export const prefetchAnalytics = (params: GetStatsInput) => {
  return prefetch(trpc.analytics.getStats.queryOptions(params));
};
