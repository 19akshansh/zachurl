import { UrlDetailsClient } from "@/features/management/urls/components/urlDetailsClient";
import { requireAuth } from "@/lib/authUtils";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { TRPCClientError } from "@trpc/client";
import { Link2Icon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ urlId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { urlId } = await params;

  await requireAuth();

  try {
    await getQueryClient().fetchQuery(
      trpc.urls.getOne.queryOptions({
        id: urlId,
      }),
    );
  } catch (error: any) {
    if (
      error?.data?.code === "NOT_FOUND" ||
      error?.shape?.data?.code === "NOT_FOUND" ||
      error?.message === "URL not found"
    ) {
      notFound();
    }

    throw error;
  }

  return (
    <HydrateClient>
      <UrlDetailsClient urlId={urlId} />
    </HydrateClient>
  );
};

export default Page;
