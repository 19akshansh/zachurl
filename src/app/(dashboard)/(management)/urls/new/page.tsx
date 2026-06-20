import { requireAuth } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { UrlForm } from "@/features/management/urls/components/urlForm";

const Page = async () => {
  await requireAuth();

  return (
    <div className="p-4 md:px-10 md:py-6">
      <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-6">
        <div className="flex items-center gap-x-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 text-muted-foreground"
          >
            <Link href="/urls">
              <ChevronLeft className="size-4 mr-1" />
              Back to Links
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Shorten a new link
          </h1>
          <p className="text-muted-foreground">
            Enter your long URL and customize your slug to get started.
          </p>
        </div>

        <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
          <UrlForm />
        </div>
      </div>
    </div>
  );
};

export default Page;
