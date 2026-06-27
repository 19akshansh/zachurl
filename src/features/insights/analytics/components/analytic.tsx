"use client";

import React from "react";
import {
  EntityHeader,
  EntityContainer,
  EntityPagination,
  LoadingView,
  EmptyView,
  EntityList,
  EntityItem,
  ErrorView,
} from "@/components/entityComponents";
import { useSuspenseAnalyticsList } from "../hooks/useAnalytics";
import { useAnalyticsParams } from "../hooks/useAnalyticsParams";
import {
  BarChart3Icon,
  MousePointerClickIcon,
  Link2Icon,
  CalendarIcon,
  TrendingUpIcon,
  RefreshCcwIcon,
  ArrowRightIcon,
} from "lucide-react";
import { RelativeTime } from "@/components/relativeTime";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

type AnalyticsQueryResult = ReturnType<typeof useSuspenseAnalyticsList>;
type UrlWithClicks = AnalyticsQueryResult["data"]["items"][number];

const RangeSelector = () => {
  const [params, setParams] = useAnalyticsParams();
  const ranges = [
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "90d", value: "90d" },
    { label: "All", value: "all" },
  ];

  return (
    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-md border border-zinc-200 dark:border-zinc-800">
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => setParams({ range: r.value as any })}
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
            params.range === r.value
              ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm border border-zinc-200 dark:border-zinc-700"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
};

const AnalyticsDashboardChart = ({ items }: { items: UrlWithClicks[] }) => {
  const data = items.slice(0, 8).map((item) => ({
    name: item.name || item.slug,
    clicks: item.totalClicks,
  }));

  return (
    <div className="w-full h-[250px] mb-6 p-4 bg-white dark:bg-zinc-950 border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded-lg">
            <TrendingUpIcon className="size-4 text-blue-500" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
            Top Links Performance
          </h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#888888"
            strokeOpacity={0.1}
          />

          <XAxis dataKey="name" hide /> 
          
          <YAxis
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#888" }}
            allowDecimals={false}
            domain={[0, "dataMax + 1"]}
          />
          <Tooltip
            labelStyle={{ color: "#fff" }}
            contentStyle={{
              backgroundColor: "#18181b",
              borderRadius: "8px",
              border: "1px solid #27272a",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
          />
          <Area
            type="monotone"
            dataKey="clicks" 
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorClicks)"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: "#3b82f6",
              strokeWidth: 2,
              stroke: "#09090b",
            }}
            activeDot={{
              r: 6,
              strokeWidth: 0,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AnalyticsItem = ({ data }: { data: UrlWithClicks }) => {
  return (
    <EntityItem
      href={`/urls/${data.id}?tab=analytics`}
      title={data.name || `/${data.slug}`}
      subtitle={
        <div className="flex flex-col gap-2 mt-2 w-full">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link2Icon className="size-3 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-[400px]">
              {data.originalUrl}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1 w-full">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/5 border border-blue-500/10 rounded-md text-blue-600 font-bold text-[10px] tracking-tight">
                <MousePointerClickIcon className="size-3" />
                {data.totalClicks.toLocaleString()} CLICKS
              </div>

              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-medium">
                <CalendarIcon className="size-3" />
                <RelativeTime date={data.createdAt} />
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 group-hover:text-blue-500 transition-colors uppercase tracking-widest whitespace-nowrap ml-4">
              Detailed Stats
              <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      }
      image={
        <div className="size-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 group-hover:bg-blue-600/20 transition-all">
          <BarChart3Icon className="size-5 text-blue-600" />
        </div>
      }
    />
  );
};

export const AnalyticsContainer = () => {
  return (
    <React.Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsData />
    </React.Suspense>
  );
};

const AnalyticsData = () => {
  const analytics = useSuspenseAnalyticsList();
  const [params, setParams] = useAnalyticsParams();

  return (
    <EntityContainer
      header={
        <div className="flex items-end justify-between mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-900">
          <EntityHeader
            title="Link Analytics"
            description="Track performance and growth across all your short links"
          />
          <RangeSelector />
        </div>
      }
      pagination={
        <EntityPagination
          disabled={analytics.isFetching}
          totalPages={analytics.data.totalPages}
          page={analytics.data.page}
          onPageChange={(page) => setParams({ page })}
        />
      }
    >
      <div className="space-y-4">
        {analytics.data.items.length > 0 && (
          <AnalyticsDashboardChart items={analytics.data.items} />
        )}

        <EntityList
          items={analytics.data.items}
          getKey={(item) => item.id}
          renderItem={(item) => <AnalyticsItem data={item} />}
          emptyView={<AnalyticsEmpty />}
        />
      </div>
    </EntityContainer>
  );
};

export const AnalyticsLoading = () => (
  <LoadingView message="Loading performance metrics..." />
);

export const AnalyticsEmpty = () => (
  <EmptyView
    entity="Analytics"
    msg="No link traffic recorded yet. Share your links to generate insights!"
  />
);

export const AnalyticsError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <ErrorView message="We couldn't load your analytics data. Please check your connection." />
      <Button
        variant="outline"
        size="sm"
        className="mt-4 gap-2"
        onClick={() => window.location.reload()}
      >
        <RefreshCcwIcon className="size-3" />
        Refresh Data
      </Button>
    </div>
  );
};
