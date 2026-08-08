"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckIcon,
  ClipboardIcon,
  CopyIcon,
  KeyRoundIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ApiKey = {
  id: string;
  name: string;
  createdAt?: string | Date;
  expiresAt?: string | Date | null;
  enabled?: boolean;
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
};

const Page = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadApiKeys = useCallback(async () => {
    setIsLoading(true);

    const { data, error } = await authClient.apiKey.list({
      query: {
        limit: 50,
        offset: 0,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    });

    if (error) {
      toast.error(error.message || "Failed to load API keys.");
      setIsLoading(false);
      return;
    }

    setApiKeys((data?.apiKeys ?? []) as ApiKey[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadApiKeys();
  }, [loadApiKeys]);

  const handleCreate = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Enter a name for this API key.");
      return;
    }

    setIsCreating(true);

    const { data, error } = await authClient.apiKey.create({
      name: trimmedName,
    });

    setIsCreating(false);

    if (error) {
      toast.error(error.message || "Failed to create API key.");
      return;
    }

    if (!data?.key) {
      toast.error("The API key was created but no key value was returned.");
      return;
    }

    setName("");
    setIsCreateOpen(false);
    setNewKey(data.key);
    setCopied(false);
    await loadApiKeys();
  };

  const handleDelete = async (keyId: string) => {
    setIsDeleting(keyId);

    const { error } = await authClient.apiKey.delete({
      keyId,
    });

    setIsDeleting(null);

    if (error) {
      toast.error(error.message || "Failed to revoke API key.");
      return;
    }

    toast.success("API key revoked.");
    setApiKeys((keys) => keys.filter((key) => key.id !== keyId));
  };

  const handleCopy = async () => {
    if (!newKey) return;

    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      toast.success("API key copied.");
    } catch {
      toast.error("Could not copy the API key.");
    }
  };

  return (
    <main className="container mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <KeyRoundIcon className="size-5 text-blue-500" />
            <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create API keys for connecting ZachURL to Zachmation and other
            external applications.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusIcon />
          Create API Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API keys</CardTitle>
          <CardDescription>
            API keys authenticate requests to your ZachURL REST API. Treat them
            like passwords and only share them with trusted services.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              Loading API keys...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center">
              <KeyRoundIcon className="mx-auto mb-3 size-8 text-muted-foreground/60" />
              <h2 className="font-medium">No API keys yet</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Create a key to connect ZachURL with Zachmation.
              </p>
              <Button
                className="mt-5"
                variant="outline"
                onClick={() => setIsCreateOpen(true)}
              >
                <PlusIcon />
                Create your first key
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <KeyRoundIcon className="size-4 shrink-0 text-muted-foreground" />
                      <p className="truncate font-medium">{key.name}</p>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Created {formatDate(key.createdAt)}</span>
                      <span>
                        {key.expiresAt
                          ? `Expires ${formatDate(key.expiresAt)}`
                          : "No expiration"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting === key.id}
                    onClick={() => void handleDelete(key.id)}
                  >
                    {isDeleting === key.id ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <Trash2Icon />
                    )}
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        API keys are only revealed when they are created. ZachURL does not
        display the secret value again after creation.
      </p>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!isCreating) setIsCreateOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Give this key a recognizable name, such as{" "}
              <span className="font-medium">Zachmation</span>. The secret will
              be shown once after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="api-key-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="api-key-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isCreating) {
                  event.preventDefault();
                  void handleCreate();
                }
              }}
              placeholder="Zachmation"
              autoFocus
              disabled={isCreating}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={isCreating}>
              {isCreating && <Loader2Icon className="animate-spin" />}
              Create API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(newKey)}
        onOpenChange={(open) => {
          if (!open) setNewKey(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API key created</DialogTitle>
            <DialogDescription>
              Copy this key now. For security, the full secret will not be
              shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="mb-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              Store this secret securely
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={newKey ?? ""}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => void handleCopy()}
                title="Copy API key"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                <span className="sr-only">Copy API key</span>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setNewKey(null)}>
              <ClipboardIcon />
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Page;
