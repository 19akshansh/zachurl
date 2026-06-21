"use client";

import React from "react";
import {
  EntityHeader,
  EntityContainer,
  EntityPagination,
  LoadingView,
  ErrorView,
  EmptyView,
  EntityList,
  EntityItem,
} from "@/components/entityComponents";
import { useSuspenseQrs } from "../hooks/useQrs";
import { useRemoveUrl } from "../../urls/hooks/useUrls";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useRouter } from "next/navigation";
import { useQrsParams } from "../hooks/useQrsParams";
import { QrCodeIcon, ExternalLinkIcon, PaletteIcon } from "lucide-react";
import { RelativeTime } from "@/components/relativeTime";

type QrsQueryResult = ReturnType<typeof useSuspenseQrs>;
type QrWithUrl = QrsQueryResult["data"]["items"][number];

export const QrsList = ({ qrs }: { qrs: QrsQueryResult }) => {
  const { modal, handleError } = useUpgradeModal();

  return (
    <>
      {modal}
      <EntityList
        items={qrs.data.items}
        getKey={(qr) => qr.id}
        renderItem={(qr) => <QrItem data={qr} onProError={handleError} />}
        emptyView={<QrsEmpty />}
      />
    </>
  );
};

export const QrsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="QR Codes"
      description="Design and manage custom QR codes for your links"
      newButtonHref="/urls/new"
      newButtonLabel="Create QR"
      disabled={disabled}
    />
  );
};

export const QrsPagination = ({ qrs }: { qrs: QrsQueryResult }) => {
  const [params, setParams] = useQrsParams();

  return (
    <EntityPagination
      disabled={qrs.isFetching}
      totalPages={qrs.data.totalPages}
      page={qrs.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const QrsData = () => {
  const qrs = useSuspenseQrs();

  return (
    <EntityContainer
      header={<QrsHeader />}
      pagination={<QrsPagination qrs={qrs} />}
    >
      <QrsList qrs={qrs} />
    </EntityContainer>
  );
};

export const QrsContainer = () => {
  return (
    <React.Suspense fallback={<QrsLoading />}>
      <QrsData />
    </React.Suspense>
  );
};

export const QrsLoading = () => (
  <LoadingView message="Loading your QR codes..." />
);

export const QrsError = () => (
  <ErrorView message="Failed to load QR codes. Please try again." />
);

export const QrsEmpty = () => {
  const router = useRouter();
  return (
    <EmptyView
      onNew={() => router.push("/urls/new")}
      entity="QR Code"
      msg="You haven't created any QR codes yet."
    />
  );
};

interface QrItemProps {
  data: QrWithUrl;
  onProError: (err: unknown) => boolean;
}

export const QrItem = ({ data, onProError }: QrItemProps) => {
  const removeUrl = useRemoveUrl();

  const handleRemove = () => {
    removeUrl.mutate(
      { id: data.urlId },
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

  const originalUrl = data.url?.originalUrl ?? "";
  const displayUrl =
    originalUrl.length > 50
      ? originalUrl.substring(0, 50) + "..."
      : originalUrl;

  return (
    <EntityItem
      href={`/urls/${data.urlId}?tab=qrcode`}
      title={data.url?.name || `/${data.url?.slug}` || "Untitled Link"}
      subtitle={
        <div className="flex flex-col gap-1.5 mt-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ExternalLinkIcon className="size-3 shrink-0" />
            <span className="truncate max-w-[250px] md:max-w-[450px]">
              {displayUrl}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
            <span className="flex items-center gap-1 font-medium bg-zinc-500/5 px-1.5 py-0.5 rounded border border-zinc-500/10">
              <PaletteIcon className="size-3" />
              <span
                className="size-2 rounded-full border border-black/10"
                style={{ backgroundColor: data.fgColor }}
              />
              {data.fgColor.toUpperCase()}
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
          <QrCodeIcon className="size-5 text-blue-600" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeUrl.isPending}
    />
  );
};
