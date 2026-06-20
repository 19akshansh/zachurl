import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.urls.getMany>;

export const prefetchUrls = (params: GetManyInput) => {
  return prefetch(trpc.urls.getMany.queryOptions(params));
};

export const prefetchUrl = (id: string) => {
  return prefetch(trpc.urls.getOne.queryOptions({ id }));
};

export const prefetchUrlAnalytics = (id: string) => {
  return prefetch(trpc.urls.getAnalytics.queryOptions({ id }));
};
