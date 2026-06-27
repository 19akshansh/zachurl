import { getQueryClient, trpc } from "@/trpc/server";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ urlId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { urlId } = await params;

  const headerList = await headers();

  const userAgent = headerList.get("user-agent") ?? undefined;

  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : undefined;

  const country = headerList.get("x-vercel-ip-country") ?? undefined;
  const city = headerList.get("x-vercel-ip-city") ?? undefined;

  try {
    const data = await getQueryClient().fetchQuery(
      trpc.urls.resolveAndTrack.queryOptions({
        slug: urlId,
        userAgent,
        ip,
        country,
        city,
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
