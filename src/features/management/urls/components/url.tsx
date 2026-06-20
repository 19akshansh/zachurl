"use client";

import React from "react";
import {
  EntityHeader,
  EntityContainer,
  EntitySearch,
  EntityPagination,
  LoadingView,
  ErrorView,
  EmptyView,
  EntityList,
  EntityItem,
} from "@/components/entityComponents";
import { useRemoveUrl, useSuspenseUrls, useUrls } from "../hooks/useUrls";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useRouter } from "next/navigation";
import { useUrlsParams } from "../hooks/useUrlsParams";
import { useEntitySearch } from "@/hooks/useEntitySearch";
import type { Url as UrlType } from "@/generated/prisma/browser";
import {
  Link2Icon,
  ExternalLinkIcon,
  MousePointerClickIcon,
} from "lucide-react";
import { RelativeTime } from "@/components/relativeTime";

type UrlsQueryResult = ReturnType<typeof useSuspenseUrls>;

export const UrlsList = ({ urls }: { urls: UrlsQueryResult }) => {
  const { modal, handleError } = useUpgradeModal();

  return (
    <>
      {modal}
      <EntityList
        items={urls.data.items}
        getKey={(url) => url.id}
        renderItem={(url) => <UrlItem data={url} onProError={handleError} />}
        emptyView={<UrlsEmpty />}
      />
    </>
  );
};

export const UrlsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="All Links"
      description="Manage, track, and customize your shortened URLs"
      newButtonHref="/urls/new"
      newButtonLabel="Shorten Link"
      disabled={disabled}
    />
  );
};

export const UrlsSearch = () => {
  const [params, setParams] = useUrlsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search by name, slug or destination..."
    />
  );
};

export const UrlsPagination = ({ urls }: { urls: UrlsQueryResult }) => {
  const [params, setParams] = useUrlsParams();

  return (
    <EntityPagination
      disabled={urls.isFetching}
      totalPages={urls.data.totalPages}
      page={urls.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const UrlsData = () => {
  const urls = useSuspenseUrls();

  return (
    <EntityContainer
      header={<UrlsHeader />}
      search={<UrlsSearch />}
      pagination={<UrlsPagination urls={urls} />}
    >
      <UrlsList urls={urls} />
    </EntityContainer>
  );
};

export const UrlsContainer = () => {
  return (
    <React.Suspense fallback={<UrlsLoading />}>
      <UrlsData />
    </React.Suspense>
  );
};

export const UrlsLoading = () => (
  <LoadingView message="Loading your links..." />
);
export const UrlsError = () => (
  <ErrorView message="Failed to load links. Please try again." />
);

export const UrlsEmpty = () => {
  const router = useRouter();
  return (
    <EmptyView
      onNew={() => router.push("/urls/new")}
      entity="Link"
      msg="No shortened links found matching your search."
    />
  );
};

interface UrlItemProps {
  data: UrlType;
  onProError: (err: unknown) => boolean;
}

export const UrlItem = ({ data, onProError }: UrlItemProps) => {
  const removeUrl = useRemoveUrl();

  const handleRemove = () => {
    removeUrl.mutate(
      { id: data.id },
      {
        onError: (err) => {
          const handled = onProError(err);
          if (!handled) {
            // Non PRO
          }
        },
      },
    );
  };

  const displayUrl =
    data.originalUrl.length > 55
      ? data.originalUrl.substring(0, 55) + "..."
      : data.originalUrl;

  return (
    <EntityItem
      href={`/urls/${data.id}`}
      title={data.name || `/${data.slug}`}
      subtitle={
        <div className="flex flex-col gap-1.5 mt-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-blue-500/80 transition-colors">
            <ExternalLinkIcon className="size-3 shrink-0" />
            <span className="truncate max-w-[250px] md:max-w-[450px]">
              {displayUrl}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
            <span className="flex items-center gap-1 font-medium text-blue-500/70 bg-blue-500/5 px-1.5 py-0.5 rounded">
              <MousePointerClickIcon className="size-3" />
              {data.totalClicks || 0} clicks
            </span>
            <span>&bull;</span>
            <span>
              Updated <RelativeTime date={data.updatedAt} />
            </span>
            <span>&bull;</span>
            <span>
              Created <RelativeTime date={data.createdAt} />
            </span>
          </div>
        </div>
      }
      image={
        <div className="size-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 group-hover:bg-blue-600/20 transition-all duration-200">
          <Link2Icon className="size-5 text-blue-600" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeUrl.isPending}
    />
  );
};
