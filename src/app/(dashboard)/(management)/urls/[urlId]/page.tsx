import { UrlDetailsClient } from "@/features/management/urls/components/urlDetailsClient";
import { requireAuth } from "@/lib/authUtils";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { Link2Icon } from "lucide-react";
import Link from "next/link";

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
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <h1 className="text-8xl font-bold tracking-tight text-blue-500">
            404
          </h1>

          <h2 className="mt-4 text-2xl font-semibold">URL not found</h2>

          <p className="mt-2 text-muted-foreground">
            The URL you're looking for doesn't exist or may have been moved.
          </p>

          <Link
            href="/urls/new"
            prefetch
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-500"
          >
            <Link2Icon className="size-4" />
            Shorten new URL
          </Link>
        </div>
      </main>
    );
  }

  return (
    <HydrateClient>
      <UrlDetailsClient urlId={urlId} />
    </HydrateClient>
  );
};

export default Page;
