"use client";

import { useSuspenseUrl } from "../hooks/useUrls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlForm } from "./urlForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CopyIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; 

export const UrlDetailsClient = ({ urlId }: { urlId: string }) => {
  const { data: url } = useSuspenseUrl(urlId);
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${url.slug}`;

  return (
    <div className="p-4 md:px-10 md:py-6 h-full flex flex-col gap-y-6 max-w-screen-xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 text-muted-foreground"
        >
          <Link href="/urls">
            <ChevronLeft className="size-4 mr-1" /> Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{url.name}</h1>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shortUrl);
              toast.success("Copied!");
            }}
            className="text-blue-500 hover:underline flex items-center gap-2 text-sm mt-1"
          >
            {shortUrl} <CopyIcon className="size-3" />
          </button>
        </div>
        <div className="bg-muted px-4 py-2 rounded-lg text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">
            Total Clicks
          </p>
          <p className="text-xl font-black">{url.totalClicks}</p>
        </div>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-6">
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:border-b-2 border-primary rounded-none bg-transparent px-0 py-2"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="qrcode"
            className="data-[state=active]:border-b-2 border-primary rounded-none bg-transparent px-0 py-2"
          >
            QR Code
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:border-b-2 border-primary rounded-none bg-transparent px-0 py-2"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 border rounded-xl bg-muted/20 animate-pulse flex items-center justify-center text-muted-foreground text-xs italic">
              Analytics coming soon...
            </div>
          </div>
        </TabsContent>

        <TabsContent value="qrcode" className="pt-6">
          <div className="max-w-md border p-8 rounded-xl flex flex-col items-center gap-4">
            <div className="size-48 bg-muted animate-pulse rounded-lg" />
            <p className="text-sm text-muted-foreground italic">
              QR Customization coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="pt-6">
          <div className="max-w-xl border p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Edit Link</h3>
            <UrlForm initialData={url} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
