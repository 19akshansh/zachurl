import { polarClient } from "@/lib/polar";

type SubscriptionStatus = "PRO" | "FREE" | "UNKNOWN";

type CacheEntry = {
  status: SubscriptionStatus;
  expiresAt: number;
};

const subscriptionCache = new Map<string, CacheEntry>();

const CACHE_TTL_MS = 60 * 1 * 1000;

export async function getSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus> {
  const cached = subscriptionCache.get(userId);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.status;
  }

  try {
    const customer = await polarClient.customers.getStateExternal({
      externalId: userId,
    });

    const hasPro =
      customer.activeSubscriptions?.some(
        (sub) =>
          sub.status === "active" &&
          sub.productId === process.env.POLAR_PRO_PRODUCT_SLUG,
      ) ?? false;

    const status: SubscriptionStatus = hasPro ? "PRO" : "FREE";

    subscriptionCache.set(userId, {
      status,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return status;
  } catch (error) {
    console.error("[POLAR_SUBSCRIPTION_CHECK_FAILED]", userId, error);

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("not found")
    ) {
      return "FREE";
    }

    return "UNKNOWN";
  }
}
