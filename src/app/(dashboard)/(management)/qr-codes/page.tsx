import { requireAuth } from "@/lib/authUtils";
import { prefetchQrs } from "@/features/management/qrs/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import {
  QrsContainer,
  QrsError,
} from "@/features/management/qrs/components/qr";
import { ErrorBoundary } from "react-error-boundary";
import { qrParamsLoader } from "@/features/management/qrs/server/paramsLoader";

type QrsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

const Page = async (props: QrsPageProps) => {
  await requireAuth();

  const { page, pageSize } = await qrParamsLoader(props.searchParams);

  try {
    await prefetchQrs({ page, pageSize });
  } catch (error) {
    console.error("[QRS_PAGE_PREFETCH_ERROR]", error);
  }

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<QrsError />}>
        <QrsContainer />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
