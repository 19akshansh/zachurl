import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.qrs.getMany>;

export const prefetchQrs = (params: GetManyInput) => {
  return prefetch(trpc.qrs.getMany.queryOptions(params));
};

export const prefetchQr = (urlId: string) => {
  return prefetch(trpc.qrs.getOne.queryOptions({ urlId }));
};
