import { requireAuth } from "@/lib/authUtils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import {
  AnalyticsContainer,
  AnalyticsError,
} from "@/features/insights/analytics/components/analytic";
import { analyticsParamsLoader } from "@/features/insights/analytics/server/paramsLoader";
import { prefetchAnalyticsList } from "@/features/insights/analytics/server/prefetch";

type AnalyticsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    range?: string;
    search?: string;
  }>;
};

const Page = async (props: AnalyticsPageProps) => {
  await requireAuth();

  const { page, pageSize } = await analyticsParamsLoader(props.searchParams);

  try {
    await prefetchAnalyticsList({
      page,
      pageSize,
    });
  } catch (error) {
    console.error("[ANALYTICS_PAGE_PREFETCH_ERROR]", error);
  }

  return (
    <HydrateClient>
      <div className="p-6 max-w-7xl mx-auto w-full">
        <ErrorBoundary fallback={<AnalyticsError />}>
          <AnalyticsContainer />
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
};

export default Page;
