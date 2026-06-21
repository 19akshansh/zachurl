import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useQrsParams } from "./useQrsParams";

const getQrsListBaseKey = (trpc: ReturnType<typeof useTRPC>) => {
  const key = trpc.qrs.getMany.queryOptions({
    page: 1,
    pageSize: 1,
  }).queryKey;

  return [key[0]];
};

export const useSuspenseQrs = () => {
  const trpc = useTRPC();
  const [params] = useQrsParams();

  return useSuspenseQuery(
    trpc.qrs.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
    }),
  );
};

export const useSuspenseQr = (urlId: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.qrs.getOne.queryOptions({ urlId }));
};

export const useUpdateQr = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.qrs.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`QR Code design updated!`);

        queryClient.invalidateQueries({
          queryKey: getQrsListBaseKey(trpc),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.qrs.getOne.queryOptions({
            urlId: data.urlId,
          }).queryKey,
        });
      },
      onError: (error) => {
        toast.error(`Failed to update QR Code: ${error.message}`);
      },
    }),
  );
};

export const useResetQrStyles = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.qrs.resetStyles.mutationOptions({
      onSuccess: (data) => {
        toast.success(`QR Code design reset to default.`);

        queryClient.invalidateQueries({
          queryKey: getQrsListBaseKey(trpc),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.qrs.getOne.queryOptions({
            urlId: data.urlId,
          }).queryKey,
        });
      },
      onError: (error) => {
        toast.error(`Failed to reset QR Code: ${error.message}`);
      },
    }),
  );
};

export const useQrs = () => {
  const trpc = useTRPC();
  const [params] = useQrsParams();

  return useQuery(
    trpc.qrs.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
    }),
  );
};
