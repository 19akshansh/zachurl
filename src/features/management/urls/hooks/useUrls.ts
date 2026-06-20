import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useUrlsParams } from "./useUrlsParams";

export const useSuspenseUrls = () => {
  const trpc = useTRPC();
  const [params] = useUrlsParams();

  return useSuspenseQuery(
    trpc.urls.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    }),
  );
};

export const useSuspenseUrl = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.urls.getOne.queryOptions({ id }));
};

export const useUrlAnalytics = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.urls.getAnalytics.queryOptions({ id }));
};

export const useCreateUrl = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.urls.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`URL "${data.slug}" created successfully!`);
        queryClient.invalidateQueries(trpc.urls.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to create URL: ${error.message}`);
      },
    }),
  );
};

export const useUpdateUrl = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.urls.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Changes saved successfully!`);
        queryClient.invalidateQueries(trpc.urls.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.urls.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update URL: ${error.message}`);
      },
    }),
  );
};

export const useRemoveUrl = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.urls.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`URL "${data.slug}" removed.`);
        queryClient.invalidateQueries(trpc.urls.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to remove URL: ${error.message}`);
      },
    }),
  );
};

export const useUrls = () => {
  const trpc = useTRPC();
  const [params] = useUrlsParams();

  return useQuery(
    trpc.urls.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    }),
  );
};