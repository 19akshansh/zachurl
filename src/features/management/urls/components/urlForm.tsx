"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateUrl, useUpdateUrl } from "../hooks/useUrls";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useRouter } from "next/navigation";
import { Loader2Icon, SaveIcon, LinkIcon } from "lucide-react";
import type { Url as UrlType } from "@/generated/prisma/browser";

const urlSchema = z.object({
  originalUrl: z.url("Enter a valid URL (include https://)"),
  name: z.string().min(1, "Name is required"),
  customSlug: z.string().optional(),
});

export const UrlForm = ({ initialData }: { initialData?: UrlType }) => {
  const router = useRouter();
  const { modal, handleError } = useUpgradeModal();
  const createUrl = useCreateUrl();
  const updateUrl = useUpdateUrl();

  const isEdit = !!initialData;

  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      originalUrl: initialData?.originalUrl ?? "",
      name: initialData?.name ?? "",
      customSlug: initialData?.slug ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof urlSchema>) => {
    if (isEdit) {
      updateUrl.mutate(
        {
          id: initialData.id,
          name: values.name,
          originalUrl: values.originalUrl,
        },
        { onError: handleError },
      );
    } else {
      createUrl.mutate(
        {
          ...values,
          customSlug: values.customSlug?.trim() || undefined,
        },
        {
          onSuccess: (data) => router.push(`/urls/${data.id}`),
          onError: (err) => {
            handleError(err);
          },
        },
      );
    }
  };

  return (
    <Form {...form}>
      {modal}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Portfolio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="originalUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isEdit && (
          <FormField
            control={form.control}
            name="customSlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Slug (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="my-link" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={createUrl.isPending || updateUrl.isPending}
        >
          {isEdit ? (
            <SaveIcon className="mr-2 size-4" />
          ) : (
            <LinkIcon className="mr-2 size-4" />
          )}
          {isEdit ? "Save Changes" : "Shorten URL"}
        </Button>
      </form>
    </Form>
  );
};
