import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/authClient";

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data } = await authClient.customer.state();
      return data;
    },
  });
};

export const useHasActivePROSubscription = () => {
  const { data: customerState, isLoading, ...rest } = useSubscription();

  const hasActivePROSubscription =
    customerState?.activeSubscriptions?.some(
      (subscription) =>
        subscription.status === "active" &&
        subscription.productId ===
          process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_SLUG,
    ) ?? false;

  return {
    hasActivePROSubscription,
    subscription: customerState?.activeSubscriptions?.find(
      (subscription) =>
        subscription.status === "active" &&
        subscription.productId ===
          process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_SLUG,
    ),
    isLoading,
    ...rest,
  };
};
