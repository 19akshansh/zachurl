"use client";

import React, { Suspense } from "react";
import { useSuspenseUrl } from "../hooks/useUrls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlForm } from "./urlForm";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  CopyIcon,
  QrCodeIcon,
  RefreshCcw,
  Sparkles,
  BarChart3Icon,
  MousePointerClickIcon,
  GlobeIcon,
  SmartphoneIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { QrCodeEditor } from "../../qrs/components/qrCodeEditor";
import { useGenerateQr } from "../../qrs/hooks/useQrs";
import {
  useSuspenseAnalyticsStats,
  useSuspenseRecentClicks,
} from "../../../insights/analytics/hooks/useAnalytics";
import { useAnalyticsParams } from "../../../insights/analytics/hooks/useAnalyticsParams";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RelativeTime } from "@/components/relativeTime";

const BreakdownRow = ({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-medium uppercase tracking-tight">
      <span className="truncate pr-4">{label || "Unknown"}</span>
      <span>{count.toLocaleString()}</span>
    </div>
    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
      <div
        className="bg-blue-500 h-full rounded-full transition-all duration-500"
        style={{ width: `${(count / total) * 100}%` }}
      />
    </div>
  </div>
);

const AnalyticsView = ({ urlId }: { urlId: string }) => {
  const [params, setParams] = useAnalyticsParams();
  const { data: stats } = useSuspenseAnalyticsStats(urlId);
  const { data: recentClicks } = useSuspenseRecentClicks(urlId);

  const maxDevice = Math.max(...stats.devices.map((d) => d._count), 0);
  const maxCountry = Math.max(...stats.countries.map((d) => d._count), 0);

  return (
    <div className="space-y-6 pt-2">
      <div className="flex justify-end">
        <div className="flex bg-muted/50 p-1 rounded-lg border">
          {["7d", "30d", "90d", "all"].map((r) => (
            <button
              key={r}
              onClick={() => setParams({ range: r as any })}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                params.range === r
                  ? "bg-background text-blue-600 shadow-sm border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-none shadow-none bg-zinc-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
            <BarChart3Icon className="size-3" /> Traffic Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.clicksOverTime}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.1}
              />

              <XAxis dataKey="bucket" hide />

              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
              />

              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "none",
                  borderRadius: "8px",
                }}
              />

              <Area
                type="monotone"
                dataKey="_count"
                stroke="#3b82f6"
                fill="url(#chartColor)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#3b82f6",
                  strokeWidth: 2,
                  stroke: "#09090b",
                }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
            <GlobeIcon className="size-3" /> Top Locations
          </h4>
          <div className="space-y-3">
            {stats.countries.map((c, i) => (
              <BreakdownRow
                key={i}
                label={c.country || "Other"}
                count={c._count}
                total={maxCountry}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
            <SmartphoneIcon className="size-3" /> Devices
          </h4>
          <div className="space-y-3">
            {stats.devices.map((d, i) => (
              <BreakdownRow
                key={i}
                label={d.device || "Other"}
                count={d._count}
                total={maxDevice}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
            <RefreshCcw className="size-3" /> Recent Clicks
          </h4>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
            {recentClicks.map((click) => (
              <div
                key={click.id}
                className="flex justify-between items-center text-[10px] border-b border-zinc-500/5 pb-2"
              >
                <span className="font-medium text-muted-foreground">
                  {click.browser || "Browser"} • {click.os || "OS"}
                </span>
                <span className="text-zinc-500">
                  <RelativeTime date={click.timestamp} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UrlDetailsClient = ({ urlId }: { urlId: string }) => {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "analytics";

  const generateQr = useGenerateQr();
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
        <div className="bg-muted px-4 py-2 rounded-lg text-center flex flex-col items-center justify-center min-w-[100px]">
          <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <MousePointerClickIcon className="size-3" /> Total Clicks
          </p>
          <p className="text-xl font-black">
            {url.totalClicks.toLocaleString()}
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-6">
          {["analytics", "qrcode", "settings"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="capitalize data-[state=active]:border-b-2 border-primary rounded-none bg-transparent px-0 py-2"
            >
              {tab === "qrcode" ? "QR Code" : tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="analytics" className="pt-6">
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
                Loading detailed analytics...
              </div>
            }
          >
            <AnalyticsView urlId={urlId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="qrcode" className="pt-6">
          {url.qrCode ? (
            <QrCodeEditor
              urlId={url.id}
              shortUrl={shortUrl}
              initialData={url.qrCode}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-zinc-900/30 border-white/5 gap-4">
              <div className="size-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <QrCodeIcon className="size-8 text-blue-500/50" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-zinc-200">
                  No QR Code configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generate QR Code for this URL.
                </p>
              </div>
              <Button
                onClick={() => generateQr.mutate({ urlId: url.id })}
                disabled={generateQr.isPending}
                className="mt-2"
              >
                {generateQr.isPending ? (
                  <RefreshCcw className="size-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="size-4 mr-2" />
                )}
                Generate QR Code
              </Button>
            </div>
          )}
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
