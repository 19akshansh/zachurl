import { requireAuth } from "@/lib/authUtils";
import { prefetchUrls } from "@/features/management/urls/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import {
  UrlsContainer,
  UrlsError,
} from "@/features/management/urls/components/url";
import { ErrorBoundary } from "react-error-boundary";
import { urlParamsLoader } from "@/features/management/urls/server/paramsLoader";
import { toast } from "sonner";

type UrlsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    pageSize?: string;
  }>;
};

const Page = async (props: UrlsPageProps) => {
  await requireAuth();
  const { page, pageSize, search } = await urlParamsLoader(props.searchParams);

  try {
    await prefetchUrls({ page, pageSize, search });
  } catch {
    toast.error("Something went wrong. Please try again.");
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<UrlsError />}>
        <UrlsContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
