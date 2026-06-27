import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useAnalyticsParams } from "./useAnalyticsParams";

const getAnalyticsListBaseKey = (trpc: ReturnType<typeof useTRPC>) => {
  const key = trpc.analytics.getMany.queryOptions({
    page: 1,
    pageSize: 1,
  }).queryKey;
  return [key[0]];
};

export const useSuspenseAnalyticsList = () => {
  const trpc = useTRPC();
  const [params] = useAnalyticsParams();

  return useSuspenseQuery(
    trpc.analytics.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
    }),
  );
};

export const useSuspenseAnalyticsOne = (urlId: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.analytics.getOne.queryOptions({ urlId }));
};

export const useSuspenseAnalyticsStats = (urlId: string) => {
  const trpc = useTRPC();
  const [params] = useAnalyticsParams();

  return useSuspenseQuery(
    trpc.analytics.getStats.queryOptions({
      urlId,
      range: params.range,
    }),
  );
};

export const useSuspenseRecentClicks = (urlId: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.analytics.getRecentClicks.queryOptions({ urlId }),
  );
};

export const useAnalyticsList = () => {
  const trpc = useTRPC();
  const [params] = useAnalyticsParams();

  return useQuery(
    trpc.analytics.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
    }),
  );
};
