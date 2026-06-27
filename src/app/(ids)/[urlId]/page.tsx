import { getQueryClient, trpc } from "@/trpc/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ urlId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { urlId } = await params;

  try {
    const data = await getQueryClient().fetchQuery(
      trpc.urls.resolveAndTrack.queryOptions({
        slug: urlId,
      }),
    );

    redirect(data.originalUrl);
  } catch (error: any) {
    if (
      error?.data?.code === "NOT_FOUND" ||
      error?.message === "URL not found"
    ) {
      notFound();
    }
    throw error;
  }
};

export default Page;
